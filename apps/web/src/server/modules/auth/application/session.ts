import type { AuthenticatedUser } from "@artex/contracts";
import { adminSessions, users, type Database } from "@artex/database";
import { and, eq, gt, isNull } from "drizzle-orm";
import { hashToken } from "../infrastructure/credentials";
import { ownerMfaRequired } from "../infrastructure/mfa";

export interface AuthenticatedSession {
  sessionId: string;
  expiresAt: Date;
  user: AuthenticatedUser;
  mfaRequired: boolean;
  mfaEnabled: boolean;
}

export async function findSession(
  db: Database,
  token: string,
): Promise<AuthenticatedSession | null> {
  const [row] = await db
    .select({
      sessionId: adminSessions.id,
      expiresAt: adminSessions.expiresAt,
      userId: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      mfaSecret: users.mfaSecret,
      mfaVerified: adminSessions.mfaVerified,
    })
    .from(adminSessions)
    .innerJoin(users, eq(users.id, adminSessions.userId))
    .where(
      and(
        eq(adminSessions.tokenHash, hashToken(token)),
        isNull(adminSessions.revokedAt),
        gt(adminSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!row?.isActive) return null;
  await db
    .update(adminSessions)
    .set({ lastSeenAt: new Date() })
    .where(eq(adminSessions.id, row.sessionId));
  return {
    sessionId: row.sessionId,
    expiresAt: row.expiresAt,
    user: { id: row.userId, email: row.email, name: row.name, role: row.role },
    mfaEnabled: Boolean(row.mfaSecret),
    mfaRequired:
      !row.mfaVerified &&
      (Boolean(row.mfaSecret) || (row.role === "owner" && ownerMfaRequired())),
  };
}

export async function revokeSession(db: Database, token: string) {
  await db
    .update(adminSessions)
    .set({ revokedAt: new Date() })
    .where(eq(adminSessions.tokenHash, hashToken(token)));
}
