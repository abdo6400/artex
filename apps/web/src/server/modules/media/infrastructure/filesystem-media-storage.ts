import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { MediaStorage } from "../domain/media-storage";
import { VercelBlobMediaStorage } from "./vercel-blob-media-storage";

export class FilesystemMediaStorage implements MediaStorage {
  constructor(private readonly directory: string) {}
  private filename(key: string) {
    if (!/^[a-f0-9-]{36}\.webp$/i.test(key))
      throw new Error("Invalid media storage key");
    return path.join(path.resolve(this.directory), key);
  }
  async write(key: string, bytes: Uint8Array) {
    await mkdir(this.directory, { recursive: true });
    await writeFile(this.filename(key), bytes, { flag: "wx", mode: 0o640 });
    return key;
  }
  async read(key: string) {
    return new Uint8Array(await readFile(this.filename(key)));
  }
  async remove(key: string) {
    await unlink(this.filename(key));
  }
}

export function createMediaStorage() {
  if (process.env.MEDIA_STORAGE_DRIVER === "vercel-blob")
    return new VercelBlobMediaStorage();
  const directory = process.env.MEDIA_STORAGE_PATH;
  if (!directory && process.env.NODE_ENV === "production")
    throw new Error("MEDIA_STORAGE_PATH is required in production");
  return new FilesystemMediaStorage(directory ?? ".local-media");
}
