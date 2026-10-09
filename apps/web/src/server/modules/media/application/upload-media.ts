import { randomUUID } from "node:crypto";
import { mediaAssets, type Database } from "@artex/database";
import type { MediaStorage } from "../domain/media-storage";
import { optimizeImage } from "../infrastructure/optimize-image";
import { writeAuditLog } from "@/server/shared/audit/write-audit-log";

export async function uploadMedia(
  db: Database,
  storage: MediaStorage,
  input: { bytes: Uint8Array; altAr: string; altEn: string; actorId: string },
) {
  const optimized = await optimizeImage(input.bytes);
  const id = randomUUID();
  const filename = `${id}.webp`;
  const base = process.env.MEDIA_PUBLIC_BASE_URL;
  if (!base) throw new Error("MEDIA_PUBLIC_BASE_URL is required");
  const publicUrl = `${base.replace(/\/$/, "")}/${id}`;
  const storageKey = await storage.write(filename, optimized.bytes);
  try {
    return await db.transaction(async (tx) => {
      await tx.insert(mediaAssets).values({
        id,
        storageKey,
        publicUrl,
        mimeType: "image/webp",
        width: optimized.width,
        height: optimized.height,
        altAr: input.altAr,
        altEn: input.altEn,
      });
      await writeAuditLog(tx, {
        actorUserId: input.actorId,
        action: "media.uploaded",
        entityType: "media",
        entityId: id,
        metadata: {
          width: optimized.width,
          height: optimized.height,
          bytes: optimized.bytes.length,
        },
      });
      return {
        id,
        url: publicUrl,
        width: optimized.width,
        height: optimized.height,
      };
    });
  } catch (error) {
    await storage.remove(storageKey);
    throw error;
  }
}
