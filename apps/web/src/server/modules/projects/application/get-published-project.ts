import type { Locale, PublicProjectDetail } from "@artex/contracts";
import type { ProjectRepository } from "../domain/project";

export class ProjectNotFoundError extends Error {
  constructor(slug: string) {
    super(`Published project '${slug}' was not found.`);
    this.name = "ProjectNotFoundError";
  }
}

export class GetPublishedProject {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(slug: string, locale: Locale): Promise<PublicProjectDetail> {
    const project = await this.projects.findPublishedBySlug(slug, locale);
    if (!project) throw new ProjectNotFoundError(slug);

    return {
      id: project.id,
      slug: project.slug,
      clientName: project.clientName,
      title: project.title,
      summary: project.summary,
      description: project.description,
      category: project.category,
      cover: project.cover,
      gallery: project.gallery,
      seo: project.seo,
    };
  }
}
