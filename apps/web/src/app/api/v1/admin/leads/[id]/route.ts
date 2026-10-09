import { createDatabase, leads } from "@artex/database";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { authenticateAdminRequest } from "@/server/shared/http/admin-auth";
import { problemResponse } from "@/server/shared/http/problem-response";
import { writeAuditLog } from "@/server/shared/audit/write-audit-log";
import { getRequestMetadata } from "@/server/shared/http/request-metadata";

const updateLeadSchema = z.object({
  status: z.enum(["new", "contacted", "closed", "spam"]),
});
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Context) {
  const session = await authenticateAdminRequest(request, "leads:write");
  if (!session)
    return problemResponse({
      type: "about:blank",
      title: "Unauthorized",
      status: 401,
    });
  const parsed = updateLeadSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return problemResponse({
      type: "about:blank",
      title: "Invalid lead status",
      status: 400,
    });
  if (!process.env.DATABASE_URL)
    return problemResponse({
      type: "about:blank",
      title: "Service unavailable",
      status: 503,
    });

  const { id } = await params;
  const connection = createDatabase(process.env.DATABASE_URL);
  try {
    const [updated] = await connection.db
      .update(leads)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    if (!updated)
      return problemResponse({
        type: "about:blank",
        title: "Not found",
        status: 404,
      });
    await writeAuditLog(connection.db, {
      actorUserId: session.user.id,
      action: "lead.status_changed",
      entityType: "lead",
      entityId: id,
      metadata: { status: parsed.data.status },
      ip: getRequestMetadata(request).ip,
    });
    return NextResponse.json({ data: updated });
  } finally {
    await connection.close();
  }
}
