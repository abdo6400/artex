import { createDatabase } from "@artex/database";
import { siteUpdateSchema } from "@artex/contracts";
import { NextResponse, type NextRequest } from "next/server";
import {
  getSiteContent,
  saveSiteContent,
} from "@/server/modules/site/application/site-content";
import { authenticateAdminRequest } from "@/server/shared/http/admin-auth";
import { problemResponse } from "@/server/shared/http/problem-response";

export async function GET(request: NextRequest) {
  const session = await authenticateAdminRequest(request, "content:read");
  if (!session)
    return problemResponse({
      type: "about:blank",
      title: "Unauthorized",
      status: 401,
    });
  const connection = createDatabase(process.env.DATABASE_URL!);
  try {
    return NextResponse.json({
      data: await getSiteContent(connection.db, false),
    });
  } finally {
    await connection.close();
  }
}
export async function PUT(request: NextRequest) {
  const session = await authenticateAdminRequest(request, "content:write");
  if (!session)
    return problemResponse({
      type: "about:blank",
      title: "Unauthorized",
      status: 401,
    });
  const input = siteUpdateSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!input.success)
    return problemResponse({
      type: "about:blank",
      title: "Invalid content",
      status: 400,
      detail: input.error.issues[0]?.message,
    });
  const connection = createDatabase(process.env.DATABASE_URL!);
  try {
    const result = await saveSiteContent(
      connection.db,
      input.data,
      session.user.id,
    );
    return result
      ? NextResponse.json({ data: result })
      : problemResponse({
          type: "about:blank",
          title: "Content changed. Reload before saving.",
          status: 409,
        });
  } finally {
    await connection.close();
  }
}
