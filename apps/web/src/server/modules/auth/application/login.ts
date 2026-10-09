import type { AuthenticatedUser } from "@artex/contracts";
import { adminSessions, users, type Database } from "@artex/database";
import { and, eq } from "drizzle-orm";
import { writeAuditLog } from "@/server/shared/audit/write-audit-log";
import { consumeRateLimit } from "@/server/shared/security/rate-limit";
import {
  createSessionToken,
  hashIdentifier,
  hashToken,
  hashPassword,
  verifyPassword,
} from "../infrastructure/credentials";
import { ownerMfaRequired } from "../infrastructure/mfa";
import { verifyUserMfa } from "./mfa";

const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;
const LOCK_DURATION_MS = 15 * 60 * 1000;
let dummyHash: Promise<string> | undefined;

export type LoginResult =
  | {
      status: "authenticated";
      token: string;
      expiresAt: Date;
      user: AuthenticatedUser;
      mfaRequired: boolean;
    }
  | { status: "invalid" | "locked" | "rate_limited" };

export async function login(
  db: Database,
  input: {
    email: string;
    password: string;
    code?: string;
    ip: string;
    userAgent: string | null;
  },
): Promise<LoginResult> {
  const [ipLimit, emailLimit] = await Promise.all([
    consumeRateLimit(db, {
      key: input.ip,
      bucket: "login-ip",
      limit: 10,
      windowMs: LOCK_DURATION_MS,
    }),
    consumeRateLimit(db, {
      key: input.email,
      bucket: "login-email",
      limit: 5,
      windowMs: LOCK_DURATION_MS,
    }),
  ]);
  if (!ipLimit.allowed || !emailLimit.allowed)
    return { status: "rate_limited" };

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);
  if (!user || !user.isActive) {
    dummyHash ??= hashPassword(createSessionToken());
    await verifyPassword(input.password, await dummyHash);
    return { status: "invalid" };
  }
  if (user.lockedUntil && user.lockedUntil > new Date())
    return { status: "locked" };

  if (!(await verifyPassword(input.password, user.passwordHash))) {
    const failedLoginAttempts = user.failedLoginAttempts + 1;
    await db
      .update(users)
      .set({
        failedLoginAttempts,
        lockedUntil:
          failedLoginAttempts >= 5
            ? new Date(Date.now() + LOCK_DURATION_MS)
            : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    await writeAuditLog(db, {
      actorUserId: user.id,
      action: "auth.login_failed",
      entityType: "user",
      entityId: user.id,
      ip: input.ip,
    });
    return { status: "invalid" };
  }

  if (
    user.mfaSecret &&
    (!input.code ||
      !(await verifyUserMfa(db, user.id, user.mfaSecret, input.code)))
  )
    return { status: "invalid" };
  const mfaRequired =
    !user.mfaSecret && user.role === "owner" && ownerMfaRequired();
  const token = createSessionToken();
  const expiresAt = new Date(
    Date.now() + (mfaRequired ? LOCK_DURATION_MS : SESSION_DURATION_MS),
  );
  const sessionCreated = await db.transaction(async (tx) => {
    const [current] = await tx
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.id, user.id),
          eq(users.isActive, true),
          eq(users.passwordHash, user.passwordHash),
        ),
      )
      .for("update");
    if (!current) return false;
    await tx
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    await tx.insert(adminSessions).values({
      userId: user.id,
      tokenHash: hashToken(token),
      mfaVerified: Boolean(user.mfaSecret),
      expiresAt,
      ipHash: hashIdentifier(input.ip),
      userAgent: input.userAgent,
    });
    await writeAuditLog(tx, {
      actorUserId: user.id,
      action: "auth.login_succeeded",
      entityType: "session",
      ip: input.ip,
    });
    return true;
  });
  if (!sessionCreated) return { status: "invalid" };

  return {
    status: "authenticated",
    token,
    expiresAt,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    mfaRequired,
  };
}
