import { randomBytes, scrypt as nodeScrypt } from "node:crypto";
import { promisify } from "node:util";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.RECOVERY_EMAIL?.trim().toLowerCase();
const password = process.env.RECOVERY_PASSWORD;
if (!databaseUrl || !email || !password || password.length < 12)
  throw new Error(
    "DATABASE_URL, RECOVERY_EMAIL, and RECOVERY_PASSWORD (at least 12 characters) are required.",
  );
const salt = randomBytes(16);
const key = await promisify(nodeScrypt)(password, salt, 64, {
  N: 131_072,
  r: 8,
  p: 1,
  maxmem: 256 * 1024 * 1024,
});
const passwordHash = `scrypt$131072$8$1$${salt.toString("base64")}$${key.toString("base64")}`;
const sql = postgres(databaseUrl, { max: 1, prepare: false });
try {
  await sql.begin(async (tx) => {
    const rows =
      await tx`update users set password_hash = ${passwordHash}, mfa_secret = null, mfa_pending_secret = null, mfa_last_epoch = null, failed_login_attempts = 0, locked_until = null, updated_at = now() where email = ${email} and is_active = true returning id`;
    if (!rows[0]) throw new Error("No active account matched RECOVERY_EMAIL.");
    await tx`update admin_sessions set revoked_at = now() where user_id = ${rows[0].id}`;
    await tx`insert into audit_logs (action, entity_type, entity_id, metadata) values ('auth.operator_recovery', 'user', ${rows[0].id}, '{"passwordChanged":true,"mfaReset":true}')`;
  });
  process.stdout.write(
    "Account recovered, all sessions revoked. Owner MFA enrollment is required again.\n",
  );
} finally {
  await sql.end();
}
