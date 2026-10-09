import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { generateSecret, verify } from "otplib";

function encryptionKey() {
  const value = process.env.MFA_ENCRYPTION_KEY ?? "";
  if (!/^[a-f0-9]{64}$/i.test(value))
    throw new Error("MFA_ENCRYPTION_KEY must be a 32-byte hexadecimal key.");
  return Buffer.from(value, "hex");
}

export function encryptMfaSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), encrypted]
    .map((value) => value.toString("base64url"))
    .join(".");
}

export function decryptMfaSecret(value: string) {
  const [iv, tag, encrypted] = value.split(".");
  if (!iv || !tag || !encrypted)
    throw new Error("Invalid encrypted MFA secret");
  const cipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(iv, "base64url"),
  );
  cipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    cipher.update(Buffer.from(encrypted, "base64url")),
    cipher.final(),
  ]).toString("utf8");
}

export function createMfaSecret() {
  return generateSecret();
}
export async function verifyMfaCode(secret: string, code: string) {
  if (!/^\d{6}$/.test(code)) return null;
  const result = await verify({ secret, token: code, epochTolerance: 30 });
  return result.valid && "epoch" in result
    ? Math.floor(result.epoch / 30)
    : null;
}

export function ownerMfaRequired() {
  return (
    process.env.REQUIRE_OWNER_MFA === "true" ||
    (process.env.NODE_ENV === "production" &&
      process.env.REQUIRE_OWNER_MFA !== "false")
  );
}
