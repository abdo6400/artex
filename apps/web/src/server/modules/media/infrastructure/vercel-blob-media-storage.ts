import { del, put } from "@vercel/blob";
import type { MediaStorage } from "../domain/media-storage";

function assertBlobUrl(value: string) {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(".public.blob.vercel-storage.com")
  ) {
    throw new Error("Invalid Vercel Blob storage key");
  }
  return url.toString();
}

export class VercelBlobMediaStorage implements MediaStorage {
  async write(key: string, bytes: Uint8Array) {
    if (!/^[a-f0-9-]{36}\.webp$/i.test(key))
      throw new Error("Invalid media storage key");
    const blob = await put(`artex/${key}`, Buffer.from(bytes), {
      access: "public",
      addRandomSuffix: false,
      contentType: "image/webp",
    });
    return assertBlobUrl(blob.url);
  }

  async read(key: string) {
    const response = await fetch(assertBlobUrl(key), { cache: "no-store" });
    if (!response.ok) throw new Error("Could not read media from Vercel Blob");
    return new Uint8Array(await response.arrayBuffer());
  }

  async remove(key: string) {
    await del(assertBlobUrl(key));
  }
}
