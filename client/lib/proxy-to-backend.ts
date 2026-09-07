import { NextRequest, NextResponse } from "next/server";

import { SERVER_URL } from "./config";

export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
): Promise<NextResponse> {
  const url = new URL(request.url);

  const targetUrl =
    `${SERVER_URL}${backendPath.replace(/^\/+/, "")}${url.search}`;

  const headers = new Headers();

  const headersToForward = [
    "cookie",
    "content-type",
    "accept",
    "origin",
    "user-agent",
    "referer",
  ];

  headersToForward.forEach((h) => {
    const val = request.headers.get(h);
    if (val) headers.set(h, val);
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    credentials: "include",
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  console.log("AUTH PROXY:", {
    targetUrl,
    method: request.method,
    origin: request.headers.get("origin"),
  });

  const resp = await fetch(targetUrl, init);

  const responseHeaders = new Headers();

  resp.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();

    if (
      lowerKey !== "set-cookie" &&
      lowerKey !== "content-encoding" &&
      lowerKey !== "content-length" &&
      lowerKey !== "transfer-encoding" &&
      lowerKey !== "connection"
    ) {
      responseHeaders.set(key, value);
    }
  });

  const response = new NextResponse(resp.body, {
    status: resp.status,
    headers: responseHeaders,
  });

  if (typeof resp.headers.getSetCookie === "function") {
    for (const cookie of resp.headers.getSetCookie()) {
      response.headers.append("Set-Cookie", cookie);
    }
  } else {
    const setCookie = resp.headers.get("set-cookie");

    if (setCookie) {
      response.headers.set("Set-Cookie", setCookie);
    }
  }

  return response;
}