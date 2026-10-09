import { createDatabase, mediaAssets } from "@artex/database";
import { desc } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { authenticateAdminRequest } from "@/server/shared/http/admin-auth";
import { problemResponse } from "@/server/shared/http/problem-response";
import { readBoundedBody } from "@/server/shared/http/bounded-body";
import { createMediaStorage } from "@/server/modules/media/infrastructure/filesystem-media-storage";
import { uploadMedia } from "@/server/modules/media/application/upload-media";
import { consumeRateLimit } from "@/server/shared/security/rate-limit";
import { mediaUploadFieldsSchema } from "@artex/contracts";
import { InvalidImageError } from "@/server/modules/media/domain/invalid-image-error";

export const runtime = "nodejs";
export async function GET(request: NextRequest) {
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
      data: await connection.db
        .select()
        .from(mediaAssets)
        .orderBy(desc(mediaAssets.createdAt))
        .limit(100),
    });
  } finally {
    await connection.close();
  }
}
export async function POST(request: NextRequest) {
  const session = await authenticateAdminRequest(request, "content:write");
  if (!session)
    return problemResponse({
      type: "about:blank",
      title: "Unauthorized",
      status: 401,
    });
  const connection = createDatabase(process.env.DATABASE_URL!);
  try {
    const quota = await consumeRateLimit(connection.db, {
      key: session.user.id,
      bucket: "media-upload",
      limit: 10,
      windowMs: 60_000,
    });
    if (!quota.allowed)
      return problemResponse({
        type: "about:blank",
        title: "Too many uploads",
        status: 429,
      });
    const bytes = await readBoundedBody(request, 8 * 1024 * 1024);
    const form = await new Request(request.url, {
      method: "POST",
      headers: { "content-type": request.headers.get("content-type") ?? "" },
      body: bytes,
    }).formData();
    const file = form.get("file");
    const fields = mediaUploadFieldsSchema.safeParse({
      altAr: form.get("altAr"),
      altEn: form.get("altEn"),
    });
    if (
      !(file instanceof File) ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      !fields.success
    )
      return problemResponse({
        type: "about:blank",
        title:
          "Upload a JPEG, PNG, or WebP image with Arabic and English descriptions",
        status: 400,
      });
    const data = await uploadMedia(connection.db, createMediaStorage(), {
      bytes: new Uint8Array(await file.arrayBuffer()),
      ...fields.data,
      actorId: session.user.id,
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "BODY_TOO_LARGE")
      return problemResponse({
        type: "about:blank",
        title: "Image upload exceeds 8 MB",
        status: 413,
      });
    if (error instanceof InvalidImageError || error instanceof TypeError)
      return problemResponse({
        type: "about:blank",
        title: "Could not process the image",
        status: 400,
      });
    console.error(
      JSON.stringify({
        event: "media.upload_failed",
        errorName: error instanceof Error ? error.name : "UnknownError",
      }),
    );
    return problemResponse({
      type: "about:blank",
      title: "Media service unavailable",
      status: 503,
    });
  } finally {
    await connection.close();
  }
}
