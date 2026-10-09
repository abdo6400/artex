import { loginSchema } from "@artex/contracts";
import { createDatabase } from "@artex/database";
import { NextResponse, type NextRequest } from "next/server";
import { login } from "@/server/modules/auth/application/login";
import { getRequestMetadata } from "@/server/shared/http/request-metadata";
import { problemResponse } from "@/server/shared/http/problem-response";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return problemResponse({
      type: "about:blank",
      title: "Invalid credentials",
      status: 401,
    });
  if (!process.env.DATABASE_URL)
    return problemResponse({
      type: "about:blank",
      title: "Service unavailable",
      status: 503,
    });

  const connection = createDatabase(process.env.DATABASE_URL);
  try {
    const result = await login(connection.db, {
      ...parsed.data,
      ...getRequestMetadata(request),
    });
    if (result.status === "rate_limited")
      return problemResponse({
        type: "about:blank",
        title: "Too many login attempts",
        status: 429,
      });
    if (result.status !== "authenticated")
      return problemResponse({
        type: "about:blank",
        title: "Invalid credentials",
        status: 401,
      });
    return NextResponse.json({
      data: {
        token: result.token,
        expiresAt: result.expiresAt.toISOString(),
        user: result.user,
        mfaRequired: result.mfaRequired,
      },
    });
  } finally {
    await connection.close();
  }
}
