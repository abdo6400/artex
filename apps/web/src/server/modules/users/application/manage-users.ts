import { adminSessions, users, type Database } from "@artex/database";
import { and, eq, isNull, sql } from "drizzle-orm";
import { createUserSchema, updateUserSchema } from "@artex/contracts";
import { hashPassword } from "@/server/modules/auth/infrastructure/credentials";
import { writeAuditLog } from "@/server/shared/audit/write-audit-log";

export async function listUsers(db: Database) {
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .orderBy(users.email);
}

export async function createUser(db: Database, raw: unknown, actorId: string) {
  const input = createUserSchema.parse(raw);
  const passwordHash = await hashPassword(input.password);
  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        email: input.email,
        name: input.name,
        role: input.role,
        passwordHash,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      });
    if (!user) throw new Error("User creation failed");
    await writeAuditLog(tx, {
      actorUserId: actorId,
      action: "user.created",
      entityType: "user",
      entityId: user.id,
      metadata: { role: user.role },
    });
    return user;
  });
}

export async function updateUser(
  db: Database,
  id: string,
  raw: unknown,
  actorId: string,
) {
  const input = updateUserSchema.parse(raw);
  const passwordHash = input.password
    ? await hashPassword(input.password)
    : undefined;
  return db.transaction(async (tx) => {
    // Serialize changes to owner accounts so concurrent demotions cannot remove the last owner.
    await tx.execute(sql`select pg_advisory_xact_lock(7821941)`);
    const [current] = await tx
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!current) return null;
    if (
      current.role === "owner" &&
      current.isActive &&
      ((input.role && input.role !== "owner") || input.isActive === false)
    ) {
      const owners = await tx
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.role, "owner"), eq(users.isActive, true)));
      if (owners.length <= 1) throw new Error("LAST_OWNER");
    }
    const [updated] = await tx
      .update(users)
      .set({
        name: input.name,
        role: input.role,
        isActive: input.isActive,
        passwordHash,
        updatedAt: new Date(),
        ...(passwordHash ? { failedLoginAttempts: 0, lockedUntil: null } : {}),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
      });
    if (input.role || input.isActive !== undefined || passwordHash) {
      await tx
        .update(adminSessions)
        .set({ revokedAt: new Date() })
        .where(
          and(eq(adminSessions.userId, id), isNull(adminSessions.revokedAt)),
        );
    }
    await writeAuditLog(tx, {
      actorUserId: actorId,
      action: "user.updated",
      entityType: "user",
      entityId: id,
      metadata: {
        role: input.role,
        isActive: input.isActive,
        passwordChanged: Boolean(passwordHash),
      },
    });
    return updated;
  });
}
