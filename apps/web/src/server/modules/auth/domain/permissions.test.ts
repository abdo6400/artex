import { describe, expect, it } from "vitest";
import { roleHasPermission } from "./permissions";

describe("role permissions", () => {
  it("keeps viewers read-only", () => {
    expect(roleHasPermission("viewer", "content:read")).toBe(true);
    expect(roleHasPermission("viewer", "content:write")).toBe(false);
    expect(roleHasPermission("viewer", "leads:write")).toBe(false);
  });

  it("reserves user management for owners", () => {
    expect(roleHasPermission("owner", "users:manage")).toBe(true);
    expect(roleHasPermission("admin", "users:manage")).toBe(false);
  });
});
