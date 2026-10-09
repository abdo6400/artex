import { createDatabase } from "@artex/database";
import { createUserSchema } from "@artex/contracts";
import { NextResponse, type NextRequest } from "next/server";
import { authenticateAdminRequest } from "@/server/shared/http/admin-auth";
import { problemResponse } from "@/server/shared/http/problem-response";
import {
  createUser,
  listUsers,
} from "@/server/modules/users/application/manage-users";

export async function GET(request: NextRequest) {
  const session = await authenticateAdminRequest(request, "users:manage");
  if (!session)
    return problemResponse({
      type: "about:blank",
      title: "Unauthorized",
      status: 401,
    });
  const connection = createDatabase(process.env.DATABASE_URL!);
  try {
    return NextResponse.json({ data: await listUsers(connection.db) });
  } finally {
    await connection.close();
  }
}

export async function POST(request: NextRequest) {
  const session = await authenticateAdminRequest(request, "users:manage");
  if (!session)
    return problemResponse({
      type: "about:blank",
      title: "Unauthorized",
      status: 401,
    });
  const parsed = createUserSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return problemResponse({
      type: "about:blank",
      title: "Invalid user",
      status: 400,
    });
  const connection = createDatabase(process.env.DATABASE_URL!);
  try {
    return NextResponse.json(
      { data: await createUser(connection.db, parsed.data, session.user.id) },
      { status: 201 },
    );
  } catch (error) {
    if (String(error).includes("users_email_unique"))
      return problemResponse({
        type: "about:blank",
        title: "Email already exists",
        status: 409,
      });
    throw error;
  } finally {
    await connection.close();
  }
}
