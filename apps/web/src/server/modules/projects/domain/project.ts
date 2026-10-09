export type ProjectLocale = "ar" | "en";

export interface ProjectMedia {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
}

export interface ProjectSummary {
  id: string;
  slug: string;
  clientName: string;
  title: string;
  summary: string;
  category: { slug: string; name: string };
  cover: ProjectMedia | null;
  sortOrder: number;
}

export interface ProjectDetail extends ProjectSummary {
  description: string;
  seo: { title: string | null; description: string | null };
  gallery: ProjectMedia[];
}

export interface ProjectCursor {
  sortOrder: number;
  id: string;
}

export interface ListPublishedProjectsInput {
  locale: ProjectLocale;
  category?: string;
  cursor?: ProjectCursor;
  limit: number;
}

export interface ProjectRepository {
  listPublished(input: ListPublishedProjectsInput): Promise<ProjectSummary[]>;
  findPublishedBySlug(
    slug: string,
    locale: ProjectLocale,
  ): Promise<ProjectDetail | null>;
}
