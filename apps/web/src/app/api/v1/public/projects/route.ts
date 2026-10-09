import {
  projectListQuerySchema,
  publicProjectListResponseSchema,
} from "@artex/contracts";
import { ListPublishedProjects } from "@/server/modules/projects/application/list-published-projects";
import { InvalidProjectCursorError } from "@/server/modules/projects/application/project-cursor";
import {
  createProjectRepository,
  DatabaseConfigurationError,
} from "@/server/modules/projects/infrastructure/project-repository-factory";
import { problemResponse } from "@/server/shared/http/problem-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = projectListQuerySchema.safeParse(
    Object.fromEntries(url.searchParams),
  );

  if (!parsed.success) {
    return problemResponse({
      type: "https://artexproduction.com/problems/validation",
      title: "Invalid query parameters",
      status: 400,
      detail: parsed.error.issues.map((issue) => issue.message).join("; "),
      instance: url.pathname,
    });
  }

  try {
    const result = await new ListPublishedProjects(
      createProjectRepository(),
    ).execute(parsed.data);
    return Response.json(publicProjectListResponseSchema.parse(result));
  } catch (error) {
    if (error instanceof InvalidProjectCursorError) {
      return problemResponse({
        type: "https://artexproduction.com/problems/invalid-cursor",
        title: "Invalid pagination cursor",
        status: 400,
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
