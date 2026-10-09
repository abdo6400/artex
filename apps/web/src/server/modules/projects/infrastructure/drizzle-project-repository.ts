import { and, asc, eq, gt, or, type SQL } from "drizzle-orm";
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
  ListPublishedProjectsInput,
  ProjectDetail,
  ProjectMedia,
  ProjectRepository,
  ProjectSummary,
} from "../domain/project";

export class DrizzleProjectRepository implements ProjectRepository {
  constructor(private readonly db: Database) {}

  async listPublished(
    input: ListPublishedProjectsInput,
  ): Promise<ProjectSummary[]> {
    const predicates: SQL[] = [
      eq(projects.status, "published"),
      eq(projectTranslations.locale, input.locale),
      eq(projectCategoryTranslations.locale, input.locale),
    ];

    if (input.category) {
      predicates.push(eq(projectCategories.slug, input.category));
    }

    if (input.cursor) {
      predicates.push(
        or(
          gt(projects.sortOrder, input.cursor.sortOrder),
          and(
            eq(projects.sortOrder, input.cursor.sortOrder),
            gt(projects.id, input.cursor.id),
          ),
        )!,
      );
    }

    const rows = await this.db
      .select({
        id: projects.id,
        slug: projects.slug,
        clientName: projects.clientName,
        sortOrder: projects.sortOrder,
        title: projectTranslations.title,
        summary: projectTranslations.summary,
        categorySlug: projectCategories.slug,
        categoryName: projectCategoryTranslations.name,
        coverUrl: mediaAssets.publicUrl,
        coverAltAr: mediaAssets.altAr,
        coverAltEn: mediaAssets.altEn,
        coverWidth: mediaAssets.width,
        coverHeight: mediaAssets.height,
      })
      .from(projects)
      .innerJoin(
        projectTranslations,
        eq(projectTranslations.projectId, projects.id),
      )
      .innerJoin(
        projectCategories,
        eq(projectCategories.id, projects.categoryId),
      )
      .innerJoin(
        projectCategoryTranslations,
        eq(projectCategoryTranslations.categoryId, projectCategories.id),
      )
      .leftJoin(
        projectMedia,
        and(
          eq(projectMedia.projectId, projects.id),
          eq(projectMedia.role, "cover"),
        ),
      )
      .leftJoin(mediaAssets, eq(mediaAssets.id, projectMedia.mediaId))
      .where(and(...predicates))
      .orderBy(asc(projects.sortOrder), asc(projects.id))
      .limit(input.limit);

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      clientName: row.clientName,
      sortOrder: row.sortOrder,
      title: row.title,
      summary: row.summary,
      category: { slug: row.categorySlug, name: row.categoryName },
      cover: row.coverUrl
        ? {
            url: row.coverUrl,
            alt: input.locale === "ar" ? row.coverAltAr! : row.coverAltEn!,
            width: row.coverWidth,
            height: row.coverHeight,
          }
        : null,
    }));
  }

  async findPublishedBySlug(
    slug: string,
    locale: "ar" | "en",
  ): Promise<ProjectDetail | null> {
    const [row] = await this.db
      .select({
        id: projects.id,
        slug: projects.slug,
        clientName: projects.clientName,
        sortOrder: projects.sortOrder,
        title: projectTranslations.title,
        summary: projectTranslations.summary,
        description: projectTranslations.description,
        seoTitle: projectTranslations.seoTitle,
        seoDescription: projectTranslations.seoDescription,
        categorySlug: projectCategories.slug,
        categoryName: projectCategoryTranslations.name,
      })
      .from(projects)
      .innerJoin(
        projectTranslations,
        eq(projectTranslations.projectId, projects.id),
      )
      .innerJoin(
        projectCategories,
        eq(projectCategories.id, projects.categoryId),
      )
      .innerJoin(
        projectCategoryTranslations,
        eq(projectCategoryTranslations.categoryId, projectCategories.id),
      )
      .where(
        and(
          eq(projects.slug, slug),
          eq(projects.status, "published"),
          eq(projectTranslations.locale, locale),
          eq(projectCategoryTranslations.locale, locale),
        ),
      )
      .limit(1);

    if (!row) return null;

    const mediaRows = await this.db
      .select({
        role: projectMedia.role,
        url: mediaAssets.publicUrl,
        altAr: mediaAssets.altAr,
        altEn: mediaAssets.altEn,
        width: mediaAssets.width,
        height: mediaAssets.height,
      })
      .from(projectMedia)
      .innerJoin(mediaAssets, eq(mediaAssets.id, projectMedia.mediaId))
      .where(eq(projectMedia.projectId, row.id))
      .orderBy(asc(projectMedia.sortOrder));

    const toMedia = (media: (typeof mediaRows)[number]): ProjectMedia => ({
      url: media.url,
      alt: locale === "ar" ? media.altAr : media.altEn,
      width: media.width,
      height: media.height,
    });
    const coverRow = mediaRows.find((media) => media.role === "cover");

    return {
      id: row.id,
      slug: row.slug,
      clientName: row.clientName,
      sortOrder: row.sortOrder,
      title: row.title,
      summary: row.summary,
      description: row.description,
      category: { slug: row.categorySlug, name: row.categoryName },
      seo: { title: row.seoTitle, description: row.seoDescription },
      cover: coverRow ? toMedia(coverRow) : null,
      gallery: mediaRows
        .filter((media) => media.role === "gallery")
        .map(toMedia),
    };
  }
}
