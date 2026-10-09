import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./credentials";

describe("password credentials", () => {
  it("hashes passwords with a unique salt and verifies the correct value", async () => {
    const first = await hashPassword("a secure production password");
    const second = await hashPassword("a secure production password");
    expect(first).not.toBe(second);
    await expect(
      verifyPassword("a secure production password", first),
    ).resolves.toBe(true);
    await expect(verifyPassword("wrong password", first)).resolves.toBe(false);
  });

  it("rejects malformed stored hashes", async () => {
    await expect(verifyPassword("password", "invalid")).resolves.toBe(false);
  });
});
