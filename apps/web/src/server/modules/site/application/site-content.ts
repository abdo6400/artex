import { siteContentSchema, siteUpdateSchema } from "@artex/contracts";
import { siteContent, type Database } from "@artex/database";
import { eq, sql } from "drizzle-orm";
import { writeAuditLog } from "@/server/shared/audit/write-audit-log";

export async function getSiteContent(db: Database, publishedOnly: boolean) {
  const [record] = await db
    .select()
    .from(siteContent)
    .where(eq(siteContent.id, "main"))
    .limit(1);
  if (publishedOnly)
    return record?.published ? siteContentSchema.parse(record.published) : null;
  return {
    content: record ? siteContentSchema.parse(record.draft) : null,
    version: record?.version ?? 0,
  };
}

export async function saveSiteContent(
  db: Database,
  raw: unknown,
  actorId: string,
) {
  const input = siteUpdateSchema.parse(raw);
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(7821942)`);
    const [current] = await tx
      .select()
      .from(siteContent)
      .where(eq(siteContent.id, "main"))
      .limit(1);
    if ((current?.version ?? 0) !== input.version) return null;
    const values = {
      draft: input.content,
      published: input.publish ? input.content : (current?.published ?? null),
      version: input.version + 1,
      updatedAt: new Date(),
    };
    await tx
      .insert(siteContent)
      .values({ id: "main", ...values })
      .onConflictDoUpdate({ target: siteContent.id, set: values });
    await writeAuditLog(tx, {
      actorUserId: actorId,
      action: input.publish ? "site.published" : "site.draft_saved",
      entityType: "site",
      entityId: "main",
      metadata: { version: values.version },
    });
    return { content: input.content, version: values.version };
  });
}
