import { randomBytes, scrypt as nodeScrypt } from "node:crypto";
import { promisify } from "node:util";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
const password = process.env.OWNER_PASSWORD;
const name = process.env.OWNER_NAME?.trim() || "Artex Owner";

if (!databaseUrl || !email || !password) {
  throw new Error(
    "DATABASE_URL, OWNER_EMAIL, and OWNER_PASSWORD are required.",
  );
}
if (password.length < 12)
  throw new Error("OWNER_PASSWORD must contain at least 12 characters.");

const scrypt = promisify(nodeScrypt);
const salt = randomBytes(16);
const derived = await scrypt(password, salt, 64, {
  N: 131_072,
  r: 8,
  p: 1,
  maxmem: 256 * 1024 * 1024,
});
const passwordHash = `scrypt$131072$8$1$${salt.toString("base64")}$${derived.toString("base64")}`;
const sql = postgres(databaseUrl, { max: 1, prepare: false });

try {
  await sql`
    insert into users (email, name, password_hash, role, is_active)
    values (${email}, ${name}, ${passwordHash}, 'owner', true)
    on conflict (email) do nothing
  `;
  process.stdout.write(`Owner account ready for ${email}.\n`);
} finally {
  await sql.end();
}
