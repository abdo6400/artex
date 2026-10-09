import type { UserRole } from "@artex/contracts";

export type Permission =
  | "content:read"
  | "content:write"
  | "leads:read"
  | "leads:write"
  | "audit:read"
  | "users:manage";

const permissions: Record<UserRole, ReadonlySet<Permission>> = {
  owner: new Set([
    "content:read",
    "content:write",
    "leads:read",
    "leads:write",
    "audit:read",
    "users:manage",
  ]),
  admin: new Set([
    "content:read",
    "content:write",
    "leads:read",
    "leads:write",
    "audit:read",
  ]),
  editor: new Set(["content:read", "content:write", "leads:read"]),
  viewer: new Set(["content:read", "leads:read"]),
};

export function roleHasPermission(role: UserRole, permission: Permission) {
  return permissions[role].has(permission);
}
