import { describe, expect, it } from "vitest";
import { contentSecurityPolicy } from "@artex/config/security";
describe("browser security policy", () => {
  it("requires a nonce for scripts and excludes production eval", () => {
    const nonce = "a".repeat(44);
    const policy = contentSecurityPolicy(nonce);
    expect(policy).toContain(`'nonce-${nonce}'`);
    expect(policy).toContain("'strict-dynamic'");
    expect(policy).not.toContain("'unsafe-eval'");
    expect(policy).toContain("frame-ancestors 'none'");
  });
  it("rejects nonce values that could inject a header directive", () => {
    expect(() => contentSecurityPolicy("x'; script-src *")).toThrow();
  });
});
