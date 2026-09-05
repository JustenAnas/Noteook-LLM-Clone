import { NextRequest, NextResponse } from "next/server";
import { SERVER_URL } from "./config";

export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
): Promise<NextResponse> {
  const url = new URL(request.url);
  const targetUrl = `${SERVER_URL}${backendPath}${url.search}`;

  const headers = new Headers();
  
  // Forward essential headers for better-auth CSRF and session validation
  const headersToForward = [
    "cookie",
    "content-type",
    "accept", 
    "origin", 
    // "host", 
    "user-agent", 
    "referer"];
  headersToForward.forEach((h) => {
    const val = request.headers.get(h);
    if (val) headers.set(h, val);
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    credentials: "include",
    redirect: "manual", // IMPORTANT: Don't follow redirects, pass them to the client
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
  
  // Forward all response headers except set-cookie (which needs special handling)
  resp.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie" && key.toLowerCase() !== "content-encoding") {
      responseHeaders.set(key, value);
    }
  });

  const response = new NextResponse(resp.body, {
    status: resp.status,
    headers: responseHeaders,
  });

  if (typeof resp.headers.getSetCookie === "function") {
    for (const c of resp.headers.getSetCookie()) {
      response.headers.append("Set-Cookie", c);
    }
  } else {
    const setCookie = resp.headers.get("set-cookie");
    if (setCookie) response.headers.set("Set-Cookie", setCookie);
  }

  return response;
}
