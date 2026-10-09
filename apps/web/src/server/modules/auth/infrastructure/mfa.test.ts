import { afterEach, describe, expect, it } from "vitest";
import { createMfaSecret, decryptMfaSecret, encryptMfaSecret } from "./mfa";

const original = process.env.MFA_ENCRYPTION_KEY;
afterEach(() => {
  if (original === undefined) delete process.env.MFA_ENCRYPTION_KEY;
  else process.env.MFA_ENCRYPTION_KEY = original;
});
describe("encrypted MFA secrets", () => {
  it("uses authenticated encryption with a distinct nonce for each secret", () => {
    process.env.MFA_ENCRYPTION_KEY = "a".repeat(64);
    const secret = createMfaSecret();
    const first = encryptMfaSecret(secret);
    expect(first).not.toContain(secret);
    expect(encryptMfaSecret(secret)).not.toBe(first);
    expect(decryptMfaSecret(first)).toBe(secret);
    const pieces = first.split(".");
    pieces[1] = Buffer.alloc(16).toString("base64url");
    expect(() => decryptMfaSecret(pieces.join("."))).toThrow();
  });
  it("requires a valid encryption key", () => {
    delete process.env.MFA_ENCRYPTION_KEY;
    expect(() => encryptMfaSecret("secret")).toThrow("MFA_ENCRYPTION_KEY");
  });
});
