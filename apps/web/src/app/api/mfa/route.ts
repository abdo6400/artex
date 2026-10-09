import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/features/dashboard/lib/auth";

async function forward(request: NextRequest) {
  if (
    request.headers.get("origin") !==
    (process.env.DASHBOARD_ORIGIN ?? "http://localhost:3000")
  )
    return NextResponse.json({ title: "Invalid origin" }, { status: 403 });
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token)
    return NextResponse.json({ title: "Unauthorized" }, { status: 401 });
  try {
    const response = await fetch(
      `${process.env.API_INTERNAL_URL ?? "http://localhost:3000"}/api/v1/auth/mfa`,
      {
        method: request.method,
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: await request.text(),
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (response.ok && request.method === "PUT")
      store.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 12 * 60 * 60,
      });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { title: "Authentication service unavailable" },
      { status: 503 },
    );
  }
}
export const POST = forward;
export const PUT = forward;
