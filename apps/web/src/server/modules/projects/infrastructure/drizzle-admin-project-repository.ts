import { randomUUID } from "node:crypto";
import {
  mediaAssets,
  projectCategories,
  projectCategoryTranslations,
  projectMedia,
  projects,
  projectTranslations,
  type Database,
} from "@artex/database";
import type {
  CreateAdminProjectInput,
  UpdateAdminProjectInput,
  AdminProjectDetail,
} from "@artex/contracts";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { writeAuditLog } from "@/server/shared/audit/write-audit-log";
import type { AdminProjectRepository } from "../domain/admin-project-repository";
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
type ImageInput = NonNullable<CreateAdminProjectInput["cover"]>;

export class DrizzleAdminProjectRepository implements AdminProjectRepository {
  constructor(private readonly db: Database) {}
  async list() {
    const data = await this.db
      .select({
        id: projects.id,
        slug: projects.slug,
        clientName: projects.clientName,
        status: projects.status,
        sortOrder: projects.sortOrder,
        version: projects.version,
        updatedAt: projects.updatedAt,
        title: projectTranslations.title,
      })
      .from(projects)
      .leftJoin(
        projectTranslations,
        eq(projectTranslations.projectId, projects.id),
      )
      .where(eq(projectTranslations.locale, "en"))
      .orderBy(desc(projects.updatedAt));

    return data;
  }

  private async category(
    tx: Transaction,
    input: CreateAdminProjectInput["category"],
  ) {
    const [category] = await tx
      .insert(projectCategories)
      .values({ slug: input.slug })
      .onConflictDoUpdate({
        target: projectCategories.slug,
        set: { updatedAt: new Date() },
      })
      .returning({ id: projectCategories.id });
    if (!category) throw new Error("Category creation failed");
    for (const locale of ["ar", "en"] as const) {
      const name = locale === "ar" ? input.nameAr : input.nameEn;
      await tx
        .insert(projectCategoryTranslations)
        .values({ categoryId: category.id, locale, name })
        .onConflictDoUpdate({
          target: [
            projectCategoryTranslations.categoryId,
            projectCategoryTranslations.locale,
          ],
          set: { name },
        });
    }
    return category.id;
  }
  private async media(tx: Transaction, input: ImageInput) {
    const [existing] = await tx
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(eq(mediaAssets.publicUrl, input.url))
      .limit(1);
    if (existing) return existing.id;
    const [created] = await tx
      .insert(mediaAssets)
      .values({
        storageKey: `external/${randomUUID()}`,
        publicUrl: input.url,
        mimeType: "image/jpeg",
        altAr: input.altAr,
        altEn: input.altEn,
      })
      .returning({ id: mediaAssets.id });
    if (!created) throw new Error("Media creation failed");
    return created.id;
  }
  private async translations(
    tx: Transaction,
    id: string,
    input: Pick<UpdateAdminProjectInput, "ar" | "en">,
  ) {
    for (const locale of ["ar", "en"] as const) {
      const copy = input[locale];
      if (copy)
        await tx
          .insert(projectTranslations)
          .values({ projectId: id, locale, ...copy })
          .onConflictDoUpdate({
            target: [projectTranslations.projectId, projectTranslations.locale],
            set: copy,
          });
    }
  }
  private async gallery(
    tx: Transaction,
    id: string,
    images: ImageInput[],
    coverUrl?: string,
  ) {
    const seen = new Set<string>();
    for (const [index, image] of images.entries()) {
      if (image.url === coverUrl || seen.has(image.url)) continue;
      seen.add(image.url);
      const mediaId = await this.media(tx, image);
      await tx
        .insert(projectMedia)
        .values({ projectId: id, mediaId, role: "gallery", sortOrder: index });
    }
  }
  async create(input: CreateAdminProjectInput, actorId: string, ip: string) {
    return this.db.transaction(async (tx) => {
      const categoryId = await this.category(tx, input.category);
      const [created] = await tx
        .insert(projects)
        .values({
          categoryId,
          slug: input.slug,
          clientName: input.clientName,
          status: input.status,
          sortOrder: input.sortOrder,
          publishedAt: input.status === "published" ? new Date() : null,
        })
        .returning();
      if (!created) throw new Error("Project creation failed");
      await this.translations(tx, created.id, input);
      if (input.cover)
        await tx.insert(projectMedia).values({
          projectId: created.id,
          mediaId: await this.media(tx, input.cover),
          role: "cover",
        });
      await this.gallery(tx, created.id, input.gallery, input.cover?.url);
      await writeAuditLog(tx, {
        actorUserId: actorId,
        action: "project.created",
        entityType: "project",
        entityId: created.id,
        metadata: { status: created.status, slug: created.slug },
        ip,
      });
      return created;
    });
  }
  async get(id: string): Promise<AdminProjectDetail | null> {
    return this.db.transaction(
      async (tx) => {
        const [project] = await tx
          .select()
          .from(projects)
          .where(eq(projects.id, id))
          .limit(1);
        if (!project) return null;
        const [category] = await tx
          .select()
          .from(projectCategories)
          .where(eq(projectCategories.id, project.categoryId))
          .limit(1);
        if (!category) throw new Error("Project category missing");
        const categories = await tx
          .select()
          .from(projectCategoryTranslations)
          .where(
            eq(projectCategoryTranslations.categoryId, project.categoryId),
          );
        const copies = await tx
          .select()
          .from(projectTranslations)
          .where(eq(projectTranslations.projectId, id));
        const images = await tx
          .select({
            role: projectMedia.role,
            url: mediaAssets.publicUrl,
            altAr: mediaAssets.altAr,
            altEn: mediaAssets.altEn,
          })
          .from(projectMedia)
          .innerJoin(mediaAssets, eq(mediaAssets.id, projectMedia.mediaId))
          .where(eq(projectMedia.projectId, id))
          .orderBy(asc(projectMedia.sortOrder));
        const copy = (locale: "ar" | "en") => {
          const value = copies.find((row) => row.locale === locale);
          return {
            title: value?.title ?? "",
            summary: value?.summary ?? "",
            description: value?.description ?? "",
          };
        };
        const cover = images.find((image) => image.role === "cover");
        return {
          id: project.id,
          version: project.version,
          slug: project.slug,
          clientName: project.clientName,
          status: project.status,
          sortOrder: project.sortOrder,
          category: {
            slug: category.slug,
            nameAr: categories.find((row) => row.locale === "ar")?.name ?? "",
            nameEn: categories.find((row) => row.locale === "en")?.name ?? "",
          },
          ar: copy("ar"),
          en: copy("en"),
          ...(cover
            ? {
                cover: {
                  url: cover.url,
                  altAr: cover.altAr,
                  altEn: cover.altEn,
                },
              }
            : {}),
          gallery: images
            .filter((image) => image.role === "gallery")
            .map(({ url, altAr, altEn }) => ({ url, altAr, altEn })),
        };
      },
      { isolationLevel: "repeatable read", accessMode: "read only" },
    );
  }
  async update(
    id: string,
    input: UpdateAdminProjectInput,
    actorId: string,
    ip: string,
  ) {
    return this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(projects)
        .set({
          slug: input.slug,
          clientName: input.clientName,
          status: input.status,
          sortOrder: input.sortOrder,
          version: input.version + 1,
          updatedAt: new Date(),
          ...(input.status
            ? { publishedAt: input.status === "published" ? new Date() : null }
            : {}),
        })
        .where(and(eq(projects.id, id), eq(projects.version, input.version)))
        .returning();
      if (!updated) return null;
      if (input.category)
        await tx
          .update(projects)
          .set({ categoryId: await this.category(tx, input.category) })
          .where(eq(projects.id, id));
      await this.translations(tx, id, input);
      if (input.cover !== undefined || input.gallery !== undefined) {
        const existing = await this.getMedia(tx, id);
        const cover = input.cover === undefined ? existing.cover : input.cover;
        const gallery = input.gallery ?? existing.gallery;
        await tx.delete(projectMedia).where(eq(projectMedia.projectId, id));
        if (cover)
          await tx.insert(projectMedia).values({
            projectId: id,
            mediaId: await this.media(tx, cover),
            role: "cover",
          });
        await this.gallery(tx, id, gallery, cover?.url);
      }
      await writeAuditLog(tx, {
        actorUserId: actorId,
        action: "project.updated",
        entityType: "project",
        entityId: id,
        metadata: { version: updated.version, status: updated.status },
        ip,
      });
      return updated;
    });
  }
  private async getMedia(tx: Transaction, id: string) {
    const images = await tx
      .select({
        role: projectMedia.role,
        url: mediaAssets.publicUrl,
        altAr: mediaAssets.altAr,
        altEn: mediaAssets.altEn,
      })
      .from(projectMedia)
      .innerJoin(mediaAssets, eq(mediaAssets.id, projectMedia.mediaId))
      .where(eq(projectMedia.projectId, id))
      .orderBy(asc(projectMedia.sortOrder));
    return {
      cover: images.find((image) => image.role === "cover") ?? null,
      gallery: images.filter((image) => image.role === "gallery"),
    };
  }
  async archive(id: string, actorId: string, ip: string) {
    return this.db.transaction(async (tx) => {
      const [archived] = await tx
        .update(projects)
        .set({
          status: "archived",
          publishedAt: null,
          version: sql`${projects.version} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning({ id: projects.id });
      if (!archived) return false;
      await writeAuditLog(tx, {
        actorUserId: actorId,
        action: "project.archived",
        entityType: "project",
        entityId: id,
        ip,
      });
      return true;
    });
  }
}
