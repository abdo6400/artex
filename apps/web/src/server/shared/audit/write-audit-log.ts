import { auditLogs, type Database } from "@artex/database";
import { hashIdentifier } from "@/server/modules/auth/infrastructure/credentials";

export async function writeAuditLog(
  db: Database,
  input: {
    actorUserId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    ip?: string;
  },
) {
  await db.insert(auditLogs).values({
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata ?? {},
    ipHash: input.ip ? hashIdentifier(input.ip) : null,
  });
}
