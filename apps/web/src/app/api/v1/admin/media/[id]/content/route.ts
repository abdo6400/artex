import { createDatabase } from "@artex/database";
import { uuidSchema } from "@artex/contracts";
import { NextResponse, type NextRequest } from "next/server";
import { authenticateAdminRequest } from "@/server/shared/http/admin-auth";
import { problemResponse } from "@/server/shared/http/problem-response";
import { createMediaStorage } from "@/server/modules/media/infrastructure/filesystem-media-storage";
import { readMedia } from "@/server/modules/media/application/read-media";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await authenticateAdminRequest(request, "content:read");
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
      title: "Invalid image ID",
      status: 400,
    });
  const connection = createDatabase(process.env.DATABASE_URL!);
  try {
    const bytes = await readMedia(
      connection.db,
      createMediaStorage(),
      id,
      false,
    );
    if (!bytes)
      return problemResponse({
        type: "about:blank",
        title: "Image not found",
        status: 404,
      });
    return new NextResponse(new Uint8Array(bytes).buffer, {
      headers: {
        "content-type": "image/webp",
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } finally {
    await connection.close();
  }
}
