import type { Locale, PublicProjectSummary } from "@artex/contracts";
import type { ProjectRepository } from "../domain/project";
import { decodeProjectCursor, encodeProjectCursor } from "./project-cursor";

export interface ListPublishedProjectsRequest {
  locale: Locale;
  category?: string;
  cursor?: string;
  limit: number;
}

export interface ListPublishedProjectsResult {
  data: PublicProjectSummary[];
  meta: { nextCursor: string | null };
}

export class ListPublishedProjects {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(
    input: ListPublishedProjectsRequest,
  ): Promise<ListPublishedProjectsResult> {
    const rows = await this.projects.listPublished({
      locale: input.locale,
      category: input.category,
      cursor: input.cursor ? decodeProjectCursor(input.cursor) : undefined,
      limit: input.limit + 1,
    });

    const hasNextPage = rows.length > input.limit;
    const page = hasNextPage ? rows.slice(0, input.limit) : rows;
    const last = page.at(-1);

    return {
      data: page.map((project) => ({
        id: project.id,
        slug: project.slug,
        clientName: project.clientName,
        title: project.title,
        summary: project.summary,
        category: project.category,
        cover: project.cover,
      })),
      meta: {
        nextCursor:
          hasNextPage && last
            ? encodeProjectCursor({ sortOrder: last.sortOrder, id: last.id })
            : null,
      },
    };
  }
}
