import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxy-to-backend";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function handle(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  const backendPath =
    path.length > 0
      ? `/api/workspaces/${path.join("/")}`
      : "/api/workspaces";
  return proxyToBackend(request, backendPath);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
