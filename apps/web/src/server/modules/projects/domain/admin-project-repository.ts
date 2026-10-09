import type {
  CreateAdminProjectInput,
  UpdateAdminProjectInput,
  AdminProjectDetail,
} from "@artex/contracts";

export interface AdminProjectSummary {
  id: string;
  slug: string;
  clientName: string;
  status: "draft" | "published" | "archived";
  sortOrder: number;
  version: number;
  updatedAt: Date;
  title: string | null;
}
export interface AdminProjectRecord {
  id: string;
  slug: string;
  clientName: string;
  status: "draft" | "published" | "archived";
  version: number;
}
export interface AdminProjectRepository {
  get(id: string): Promise<AdminProjectDetail | null>;
  update(
    id: string,
    input: UpdateAdminProjectInput,
    actorId: string,
    ip: string,
  ): Promise<AdminProjectRecord | null>;
  archive(id: string, actorId: string, ip: string): Promise<boolean>;
  list(): Promise<AdminProjectSummary[]>;
  create(
    input: CreateAdminProjectInput,
    actorId: string,
    ip: string,
  ): Promise<AdminProjectRecord>;
}
