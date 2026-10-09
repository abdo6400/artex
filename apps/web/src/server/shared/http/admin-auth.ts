import type { Permission } from "@/server/modules/auth/domain/permissions";
import { roleHasPermission } from "@/server/modules/auth/domain/permissions";
import {
  findSession,
  type AuthenticatedSession,
} from "@/server/modules/auth/application/session";
import { createDatabase } from "@artex/database";
import type { NextRequest } from "next/server";

export async function authenticateAdminRequest(
  request: NextRequest,
  permission: Permission,
): Promise<AuthenticatedSession | null> {
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  const databaseUrl = process.env.DATABASE_URL;
  if (!token || !databaseUrl) return null;
  const connection = createDatabase(databaseUrl);
  try {
    const session = await findSession(connection.db, token);
    return session &&
      !session.mfaRequired &&
      roleHasPermission(session.user.role, permission)
      ? session
      : null;
  } finally {
    await connection.close();
  }
}
