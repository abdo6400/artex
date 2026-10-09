import { createDatabase } from "@artex/database";
import { updateAdminProjectSchema, uuidSchema } from "@artex/contracts";
import { NextResponse, type NextRequest } from "next/server";
import { authenticateAdminRequest } from "@/server/shared/http/admin-auth";
import { getRequestMetadata } from "@/server/shared/http/request-metadata";
import { problemResponse } from "@/server/shared/http/problem-response";
import { DrizzleAdminProjectRepository } from "../../infrastructure/drizzle-admin-project-repository";
import {
  getAdminProject,
  updateAdminProject,
  archiveAdminProject,
} from "../../application/manage-admin-projects";
type Context = { params: Promise<{ id: string }> };

async function handle(
  request: NextRequest,
  context: Context,
  operation: "read" | "update" | "archive",
) {
  const session = await authenticateAdminRequest(
    request,
    operation === "read" ? "content:read" : "content:write",
  );
  if (!session)
    return problemResponse({
      type: "about:blank",
      title: "Unauthorized",
      status: 401,
    });
  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success)
    return problemResponse({
      type: "about:blank",
      title: "Invalid project ID",
      status: 400,
    });
  const connection = createDatabase(process.env.DATABASE_URL!);
  const repository = new DrizzleAdminProjectRepository(connection.db);
  try {
    if (operation === "read") {
      const data = await getAdminProject(repository, id, session.user);
      return data
        ? NextResponse.json({ data })
        : problemResponse({
            type: "about:blank",
            title: "Project not found",
            status: 404,
          });
    }
    if (operation === "archive") {
      const found = await archiveAdminProject(
        repository,
        id,
        session.user,
        getRequestMetadata(request).ip,
      );
      return found
        ? new NextResponse(null, { status: 204 })
        : problemResponse({
            type: "about:blank",
            title: "Project not found",
            status: 404,
          });
    }
    const input = updateAdminProjectSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!input.success)
      return problemResponse({
        type: "about:blank",
        title: "Invalid project update",
        status: 400,
      });
    const data = await updateAdminProject(
      repository,
      id,
      input.data,
      session.user,
      getRequestMetadata(request).ip,
    );
    return data
      ? NextResponse.json({ data })
      : problemResponse({
          type: "about:blank",
          title: "Project changed. Reload before editing.",
          status: 409,
        });
  } catch (error) {
    if (error instanceof Error && error.message === "STABLE_SLUG")
      return problemResponse({
        type: "about:blank",
        title: "Project URLs stay fixed after creation",
        status: 409,
      });
    throw error;
  } finally {
    await connection.close();
  }
}
export async function getHandler(request: NextRequest, context: Context) {
  return handle(request, context, "read");
}
export async function updateHandler(request: NextRequest, context: Context) {
  return handle(request, context, "update");
}
export async function archiveHandler(request: NextRequest, context: Context) {
  return handle(request, context, "archive");
}
