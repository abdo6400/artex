import { auditLogs, createDatabase } from "@artex/database";
import { desc } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { authenticateAdminRequest } from "@/server/shared/http/admin-auth";
import { problemResponse } from "@/server/shared/http/problem-response";

export async function GET(request: NextRequest) {
  const session = await authenticateAdminRequest(request, "audit:read");
  if (!session)
    return problemResponse({
      type: "about:blank",
      title: "Unauthorized",
      status: 401,
    });
  const connection = createDatabase(process.env.DATABASE_URL!);
  try {
    const data = await connection.db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);
    return NextResponse.json({ data });
  } finally {
    await connection.close();
  }
}
