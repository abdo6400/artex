import { createDatabase } from "@artex/database";
import { NextResponse, type NextRequest } from "next/server";
import { revokeSession } from "@/server/modules/auth/application/session";

export async function POST(request: NextRequest) {
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (token && process.env.DATABASE_URL) {
    const connection = createDatabase(process.env.DATABASE_URL);
    try {
      await revokeSession(connection.db, token);
    } finally {
      await connection.close();
    }
  }
  return new NextResponse(null, { status: 204 });
}
