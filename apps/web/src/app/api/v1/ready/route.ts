import { createDatabase } from "@artex/database";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { problemResponse } from "@/server/shared/http/problem-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (
    process.env.NODE_ENV === "production" &&
    ((process.env.RATE_LIMIT_SALT?.length ?? 0) < 32 ||
      !/^[a-fA-F0-9]{64}$/.test(process.env.MFA_ENCRYPTION_KEY ?? "") ||
      (process.env.MEDIA_STORAGE_DRIVER === "vercel-blob"
        ? !process.env.BLOB_READ_WRITE_TOKEN
        : !process.env.MEDIA_STORAGE_PATH) ||
      !process.env.MEDIA_PUBLIC_BASE_URL)
  )
    return problemResponse({
      type: "about:blank",
      title: "Not ready",
      status: 503,
      detail: "Required production configuration is missing or invalid.",
    });
  if (!process.env.DATABASE_URL)
    return problemResponse({
      type: "about:blank",
      title: "Not ready",
      status: 503,
      detail: "Database is not configured.",
    });
  const connection = createDatabase(process.env.DATABASE_URL);
  try {
    // Readiness must reject a reachable database that has not been migrated.
    await connection.db.execute(
      sql`select mfa_secret, mfa_pending_secret, mfa_last_epoch from users limit 0`,
    );
    await connection.db.execute(
      sql`select mfa_verified from admin_sessions limit 0`,
    );
    await connection.db.execute(
      sql`select published, version from site_content limit 0`,
    );
    await connection.db.execute(
      sql`select consent_at, idempotency_key from leads limit 0`,
    );
    await connection.db.execute(
      sql`select storage_key from media_assets limit 0`,
    );
    return NextResponse.json({
      data: {
        service: "artex-api",
        status: "ready",
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    return problemResponse({
      type: "about:blank",
      title: "Not ready",
      status: 503,
      detail: "Database is unavailable.",
    });
  } finally {
    await connection.close();
  }
}
