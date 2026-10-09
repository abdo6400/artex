import { createDatabase, leads } from "@artex/database";
import { desc } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { authenticateAdminRequest } from "@/server/shared/http/admin-auth";
import { problemResponse } from "@/server/shared/http/problem-response";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await authenticateAdminRequest(request, "leads:read")))
    return problemResponse({
      type: "about:blank",
      title: "Unauthorized",
      status: 401,
    });
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl)
    return problemResponse({
      type: "about:blank",
      title: "Service unavailable",
      status: 503,
      detail: "Database is not configured.",
    });

  const connection = createDatabase(databaseUrl);
  try {
    const data = await connection.db
      .select()
      .from(leads)
      .orderBy(desc(leads.createdAt))
      .limit(100);
    return NextResponse.json({ data });
  } finally {
    await connection.close();
  }
}
