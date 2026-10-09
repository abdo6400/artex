import {
  mediaAssets,
  projectMedia,
  projects,
  siteContent,
  type Database,
} from "@artex/database";
import { and, eq, or, sql } from "drizzle-orm";
import type { MediaStorage } from "../domain/media-storage";

export async function readMedia(
  db: Database,
  storage: MediaStorage,
  id: string,
  publicOnly: boolean,
) {
  const [asset] = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);
  if (!asset) return null;
  if (publicOnly) {
    const [project] = await db
      .select({ id: projects.id })
      .from(projectMedia)
      .innerJoin(projects, eq(projects.id, projectMedia.projectId))
      .where(
        and(eq(projectMedia.mediaId, id), eq(projects.status, "published")),
      )
      .limit(1);
    if (!project) {
      const [site] = await db
        .select({ id: siteContent.id })
        .from(siteContent)
        .where(
          or(
            sql`${siteContent.published}->'settings'->>'heroImageUrl' = ${asset.publicUrl}`,
            sql`${siteContent.published}->'settings'->>'logoUrl' = ${asset.publicUrl}`,
          ),
        )
        .limit(1);
      if (!site) return null;
    }
  }
  return storage.read(asset.storageKey);
}
