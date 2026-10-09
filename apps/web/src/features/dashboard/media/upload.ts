import { mediaUploadResponseSchema } from "@artex/contracts";

export const MAX_IMAGE_BYTES = 7 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type UploadError = "tooLarge" | "badType" | "rateLimited" | "failed";

export class MediaUploadError extends Error {
  constructor(public readonly reason: UploadError) {
    super(reason);
  }
}

/** Alt text falls back to the file name, so one description is enough. */
export async function uploadImage(
  file: File,
  alt: { ar?: string; en?: string } = {},
): Promise<string> {
  if (!ACCEPTED_TYPES.includes(file.type))
    throw new MediaUploadError("badType");
  if (file.size > MAX_IMAGE_BYTES) throw new MediaUploadError("tooLarge");
  const fallback =
    file.name.replace(/\.[a-z0-9]+$/i, "").slice(0, 280) || "Image";
  const data = new FormData();
  data.append("file", file);
  data.append("altAr", (alt.ar || alt.en || fallback).slice(0, 300));
  data.append("altEn", (alt.en || alt.ar || fallback).slice(0, 300));
  let response: Response;
  try {
    response = await fetch("/api/admin/media", { method: "POST", body: data });
  } catch {
    throw new MediaUploadError("failed");
  }
  if (response.status === 429) throw new MediaUploadError("rateLimited");
  const parsed = mediaUploadResponseSchema.safeParse(
    await response.json().catch(() => null),
  );
  if (!response.ok || !parsed.success) throw new MediaUploadError("failed");
  return parsed.data.data.url;
}
