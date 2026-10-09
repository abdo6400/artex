import { createDatabase } from "@artex/database";
import { uuidSchema } from "@artex/contracts";
import { readMedia } from "@/server/modules/media/application/read-media";
import { NextResponse } from "next/server";
import { createMediaStorage } from "@/server/modules/media/infrastructure/filesystem-media-storage";
import { problemResponse } from "@/server/shared/http/problem-response";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success || !process.env.DATABASE_URL)
    return problemResponse({
      type: "about:blank",
      title: "Image not found",
      status: 404,
    });
  const connection = createDatabase(process.env.DATABASE_URL);
  try {
    const bytes = await readMedia(
      connection.db,
      createMediaStorage(),
      id,
      true,
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
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } finally {
    await connection.close();
  }
}
