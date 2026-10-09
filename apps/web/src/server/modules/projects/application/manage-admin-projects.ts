import type {
  UpdateAdminProjectInput,
  AuthenticatedUser,
  CreateAdminProjectInput,
} from "@artex/contracts";
import type { AdminProjectRepository } from "../domain/admin-project-repository";
import { roleHasPermission } from "@/server/modules/auth/domain/permissions";

export async function listAdminProjects(
  repository: AdminProjectRepository,
  actor: AuthenticatedUser,
) {
  if (!roleHasPermission(actor.role, "content:read"))
    throw new Error("FORBIDDEN");
  return repository.list();
}

export async function getAdminProject(
  repository: AdminProjectRepository,
  id: string,
  actor: AuthenticatedUser,
) {
  if (!roleHasPermission(actor.role, "content:read"))
    throw new Error("FORBIDDEN");
  return repository.get(id);
}
export async function updateAdminProject(
  repository: AdminProjectRepository,
  id: string,
  input: UpdateAdminProjectInput,
  actor: AuthenticatedUser,
  ip: string,
) {
  if (!roleHasPermission(actor.role, "content:write"))
    throw new Error("FORBIDDEN");
  const current = await repository.get(id);
  if (current && input.slug !== undefined && input.slug !== current.slug)
    throw new Error("STABLE_SLUG");
  return repository.update(id, input, actor.id, ip);
}
export async function archiveAdminProject(
  repository: AdminProjectRepository,
  id: string,
  actor: AuthenticatedUser,
  ip: string,
) {
  if (!roleHasPermission(actor.role, "content:write"))
    throw new Error("FORBIDDEN");
  return repository.archive(id, actor.id, ip);
}
export async function createAdminProject(
  repository: AdminProjectRepository,
  input: CreateAdminProjectInput,
  actor: AuthenticatedUser,
  ip: string,
) {
  if (!roleHasPermission(actor.role, "content:write"))
    throw new Error("FORBIDDEN");
  return repository.create(input, actor.id, ip);
}
