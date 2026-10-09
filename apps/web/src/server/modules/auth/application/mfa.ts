import { adminSessions, users, type Database } from "@artex/database";
import { and, eq, gt, isNull, lt, or } from "drizzle-orm";
import {
  createMfaSecret,
  decryptMfaSecret,
  encryptMfaSecret,
  verifyMfaCode,
} from "../infrastructure/mfa";
import { consumeRateLimit } from "@/server/shared/security/rate-limit";
import { writeAuditLog } from "@/server/shared/audit/write-audit-log";

export async function beginMfaEnrollment(db: Database, userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user || user.mfaSecret) return null;
  const secret = createMfaSecret();
  const pending = encryptMfaSecret(secret);
  const [updated] = await db
    .update(users)
    .set({ mfaPendingSecret: pending })
    .where(and(eq(users.id, userId), isNull(users.mfaSecret)))
    .returning({ id: users.id });
  if (!updated) return null;
  return {
    secret,
    uri: `otpauth://totp/${encodeURIComponent(`Artex:${user.email}`)}?secret=${encodeURIComponent(secret)}&issuer=Artex&algorithm=SHA1&digits=6&period=30`,
  };
}

export async function confirmMfaEnrollment(
  db: Database,
  userId: string,
  sessionId: string,
  code: string,
) {
  const quota = await consumeRateLimit(db, {
    key: userId,
    bucket: "mfa-confirm",
    limit: 5,
    windowMs: 15 * 60_000,
  });
  if (!quota.allowed) return false;
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user?.mfaPendingSecret || user.mfaSecret) return false;
  const epoch = await verifyMfaCode(
    decryptMfaSecret(user.mfaPendingSecret),
    code,
  );
  if (epoch === null) return false;
  return db.transaction(async (tx) => {
    const [activeUser] = await tx
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.id, userId),
          eq(users.isActive, true),
          eq(users.passwordHash, user.passwordHash),
        ),
      )
      .for("update");
    if (!activeUser) return false;
    const [activeSession] = await tx
      .select({ id: adminSessions.id })
      .from(adminSessions)
      .where(
        and(
          eq(adminSessions.id, sessionId),
          eq(adminSessions.userId, userId),
          isNull(adminSessions.revokedAt),
          gt(adminSessions.expiresAt, new Date()),
        ),
      )
      .for("update");
    if (!activeSession) return false;
    const [updated] = await tx
      .update(users)
      .set({
        mfaSecret: user.mfaPendingSecret,
        mfaPendingSecret: null,
        mfaLastEpoch: epoch,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(users.id, userId),
          eq(users.isActive, true),
          eq(users.passwordHash, user.passwordHash),
          isNull(users.mfaSecret),
          eq(users.mfaPendingSecret, user.mfaPendingSecret!),
        ),
      )
      .returning({ id: users.id });
    if (!updated) return false;
    await tx
      .update(adminSessions)
      .set({ revokedAt: new Date() })
      .where(eq(adminSessions.userId, userId));
    await tx
      .update(adminSessions)
      .set({
        revokedAt: null,
        mfaVerified: true,
        expiresAt: new Date(Date.now() + 12 * 60 * 60_000),
      })
      .where(
        and(
          eq(adminSessions.id, sessionId),
          eq(adminSessions.userId, userId),
          gt(adminSessions.expiresAt, new Date()),
        ),
      );
    await writeAuditLog(tx, {
      actorUserId: userId,
      action: "auth.mfa_enabled",
      entityType: "user",
      entityId: userId,
    });
    return true;
  });
}

export async function verifyUserMfa(
  db: Database,
  userId: string,
  encryptedSecret: string,
  code: string,
) {
  const epoch = await verifyMfaCode(decryptMfaSecret(encryptedSecret), code);
  if (epoch === null) return false;
  const [updated] = await db
    .update(users)
    .set({ mfaLastEpoch: epoch })
    .where(
      and(
        eq(users.id, userId),
        eq(users.mfaSecret, encryptedSecret),
        or(isNull(users.mfaLastEpoch), lt(users.mfaLastEpoch, epoch)),
      ),
    )
    .returning({ id: users.id });
  return Boolean(updated);
}
