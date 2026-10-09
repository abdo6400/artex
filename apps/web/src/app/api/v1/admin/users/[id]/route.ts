import { createDatabase } from "@artex/database";
import { updateUserSchema, uuidSchema } from "@artex/contracts";
import { NextResponse, type NextRequest } from "next/server";
import { authenticateAdminRequest } from "@/server/shared/http/admin-auth";
import { problemResponse } from "@/server/shared/http/problem-response";
import { updateUser } from "@/server/modules/users/application/manage-users";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await authenticateAdminRequest(request, "users:manage");
  if (!session)
    return problemResponse({
      type: "about:blank",
      title: "Unauthorized",
      status: 401,
    });
  const { id } = await context.params;
  const parsed = updateUserSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!uuidSchema.safeParse(id).success || !parsed.success)
    return problemResponse({
      type: "about:blank",
      title: "Invalid user update",
      status: 400,
    });
  const connection = createDatabase(process.env.DATABASE_URL!);
  try {
    const user = await updateUser(
      connection.db,
      id,
      parsed.data,
      session.user.id,
    );
    if (!user)
      return problemResponse({
        type: "about:blank",
        title: "User not found",
        status: 404,
      });
    return NextResponse.json({ data: user });
  } catch (error) {
    if (error instanceof Error && error.message === "LAST_OWNER")
      return problemResponse({
        type: "about:blank",
        title: "Keep at least one active owner",
        status: 409,
      });
    throw error;
  } finally {
    await connection.close();
  }
}
