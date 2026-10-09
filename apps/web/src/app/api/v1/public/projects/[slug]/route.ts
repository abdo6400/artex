import {
  localeSchema,
  publicProjectDetailResponseSchema,
} from "@artex/contracts";
import {
  GetPublishedProject,
  ProjectNotFoundError,
} from "@/server/modules/projects/application/get-published-project";
import {
  createProjectRepository,
  DatabaseConfigurationError,
} from "@/server/modules/projects/infrastructure/project-repository-factory";
import { problemResponse } from "@/server/shared/http/problem-response";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const url = new URL(request.url);
  const locale = localeSchema.safeParse(url.searchParams.get("locale") ?? "ar");
  const { slug } = await context.params;

  if (!locale.success) {
    return problemResponse({
      type: "https://artexproduction.com/problems/validation",
      title: "Invalid locale",
      status: 400,
      detail: "Locale must be 'ar' or 'en'.",
      instance: url.pathname,
    });
  }

  try {
    const project = await new GetPublishedProject(
      createProjectRepository(),
    ).execute(slug, locale.data);
    return Response.json(
      publicProjectDetailResponseSchema.parse({ data: project }),
    );
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      return problemResponse({
        type: "https://artexproduction.com/problems/not-found",
        title: "Project not found",
        status: 404,
        detail: error.message,
        instance: url.pathname,
      });
    }

    if (error instanceof DatabaseConfigurationError) {
      return problemResponse({
        type: "https://artexproduction.com/problems/service-unavailable",
        title: "Service unavailable",
        status: 503,
        detail: "The project database is not configured.",
        instance: url.pathname,
      });
    }

    throw error;
  }
}
