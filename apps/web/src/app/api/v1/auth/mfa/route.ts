import { createDatabase } from "@artex/database";
import { mfaCodeSchema } from "@artex/contracts";
import { NextResponse, type NextRequest } from "next/server";
import { findSession } from "@/server/modules/auth/application/session";
import {
  beginMfaEnrollment,
  confirmMfaEnrollment,
} from "@/server/modules/auth/application/mfa";
import { problemResponse } from "@/server/shared/http/problem-response";

async function enroll(request: NextRequest, confirm: boolean) {
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
    if (!confirm) {
      const setup = await beginMfaEnrollment(connection.db, session.user.id);
      if (!setup)
        return problemResponse({
          type: "about:blank",
          title: "MFA is already enabled",
          status: 409,
        });
      return NextResponse.json(
        { data: setup },
        { headers: { "cache-control": "no-store" } },
      );
    }
    const input = mfaCodeSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (
      !input.success ||
      !(await confirmMfaEnrollment(
        connection.db,
        session.user.id,
        session.sessionId,
        input.data.code,
      ))
    )
      return problemResponse({
        type: "about:blank",
        title: "Invalid or expired authenticator code",
        status: 400,
      });
    return NextResponse.json({ data: { enabled: true } });
  } finally {
    await connection.close();
  }
}
export async function POST(request: NextRequest) {
  return enroll(request, false);
}
export async function PUT(request: NextRequest) {
  return enroll(request, true);
}
