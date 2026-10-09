import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/features/dashboard/lib/auth";

type Context = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, context: Context) {
  if (request.method !== "GET") {
    const expectedOrigin =
      process.env.DASHBOARD_ORIGIN ?? "http://localhost:3000";
    if (request.headers.get("origin") !== expectedOrigin)
      return NextResponse.json({ title: "Invalid origin" }, { status: 403 });
  }
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ title: "Unauthorized" }, { status: 401 });
  }
  const { path } = await context.params;
  if (!path.every((segment) => /^[a-zA-Z0-9-]+$/.test(segment)))
    return NextResponse.json({ title: "Invalid path" }, { status: 400 });
  const base = process.env.API_INTERNAL_URL ?? "http://localhost:3000";
  try {
    const response = await fetch(`${base}/api/v1/admin/${path.join("/")}`, {
      method: request.method,
      headers: {
        authorization: `Bearer ${token}`,
        "content-type":
          request.headers.get("content-type") ?? "application/json",
      },
      body: request.method === "GET" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
    });
    return new NextResponse(
      response.status === 204 ? null : await response.arrayBuffer(),
      {
        status: response.status,
        headers: {
          "content-type":
            response.headers.get("content-type") ?? "application/json",
        },
      },
    );
  } catch {
    return NextResponse.json({ title: "API unavailable" }, { status: 503 });
  }
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
