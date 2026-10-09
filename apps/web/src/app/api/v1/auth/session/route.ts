import { createDatabase } from "@artex/database";
import { NextResponse, type NextRequest } from "next/server";
import { findSession } from "@/server/modules/auth/application/session";
import { problemResponse } from "@/server/shared/http/problem-response";

export async function GET(request: NextRequest) {
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!token || !process.env.DATABASE_URL)
    return problemResponse({
      type: "about:blank",
      title: "Unauthorized",
      status: 401,
    });
  const connection = createDatabase(process.env.DATABASE_URL);
  try {
    const session = await findSession(connection.db, token);
    if (!session)
      return problemResponse({
        type: "about:blank",
        title: "Unauthorized",
        status: 401,
      });
    return NextResponse.json({
      data: {
        user: session.user,
        expiresAt: session.expiresAt.toISOString(),
        mfaRequired: session.mfaRequired,
        mfaEnabled: session.mfaEnabled,
      },
    });
  } finally {
    await connection.close();
  }
}
