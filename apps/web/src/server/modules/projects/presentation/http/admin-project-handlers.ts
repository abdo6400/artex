import { createAdminProjectSchema } from "@artex/contracts";
import { createDatabase } from "@artex/database";
import { NextResponse, type NextRequest } from "next/server";
import { authenticateAdminRequest } from "@/server/shared/http/admin-auth";
import { getRequestMetadata } from "@/server/shared/http/request-metadata";
import { problemResponse } from "@/server/shared/http/problem-response";
import { DrizzleAdminProjectRepository } from "../../infrastructure/drizzle-admin-project-repository";
import {
  createAdminProject,
  listAdminProjects,
} from "../../application/manage-admin-projects";

export async function listHandler(request: NextRequest) {
  const session = await authenticateAdminRequest(request, "content:read");
  if (!session)
    return problemResponse({
      type: "about:blank",
      title: "Unauthorized",
      status: 401,
    });
  const connection = createDatabase(process.env.DATABASE_URL!);
  try {
    return NextResponse.json({
      data: await listAdminProjects(
        new DrizzleAdminProjectRepository(connection.db),
        session.user,
      ),
    });
  } finally {
    await connection.close();
  }
}
export async function createHandler(request: NextRequest) {
  const session = await authenticateAdminRequest(request, "content:write");
  if (!session)
    return problemResponse({
      type: "about:blank",
      title: "Unauthorized",
      status: 401,
    });
  const input = createAdminProjectSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!input.success)
    return problemResponse({
      type: "about:blank",
      title: "Invalid project",
      status: 400,
      detail: input.error.issues[0]?.message,
    });
  const connection = createDatabase(process.env.DATABASE_URL!);
  try {
    return NextResponse.json(
      {
        data: await createAdminProject(
          new DrizzleAdminProjectRepository(connection.db),
          input.data,
          session.user,
          getRequestMetadata(request).ip,
        ),
      },
      { status: 201 },
    );
  } catch (error) {
    if (String(error).includes("projects_slug_unique"))
      return problemResponse({
        type: "about:blank",
        title: "Slug already exists",
        status: 409,
      });
    throw error;
  } finally {
    await connection.close();
  }
}
