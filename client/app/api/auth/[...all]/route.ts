import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxy-to-backend";

type RouteContext = {
  params: Promise<{ all: string[] }>;
};

async function handle(request: NextRequest, context: RouteContext) {
  const { all } = await context.params;
  const path = all.join("/");
  return proxyToBackend(request, `/api/auth/${path}`);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
