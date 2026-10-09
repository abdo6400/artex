import type { MetadataRoute } from "next";
import { publicProjectListResponseSchema } from "@artex/contracts";
import { siteUrl } from "@/lib/seo";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = ["ar", "en"].map((locale) => ({
    url: siteUrl(`/${locale}`),
    changeFrequency: "weekly",
    priority: 1,
    alternates: { languages: { ar: siteUrl("/ar"), en: siteUrl("/en") } },
  }));
  const api = process.env.API_INTERNAL_URL ?? "http://localhost:3000";
  let cursor: string | null = null;
  const seen = new Set<string>();
  try {
    for (let page = 0; page < 100; page += 1) {
      const query = new URLSearchParams({
        locale: "en",
        limit: "50",
        ...(cursor ? { cursor } : {}),
      });
      const response = await fetch(`${api}/api/v1/public/projects?${query}`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) break;
      const payload = publicProjectListResponseSchema.parse(
        await response.json(),
      );
      for (const project of payload.data)
        for (const locale of ["ar", "en"])
          entries.push({
            url: siteUrl(`/${locale}/projects/${project.slug}`),
            changeFrequency: "monthly",
            alternates: {
              languages: {
                ar: siteUrl(`/ar/projects/${project.slug}`),
                en: siteUrl(`/en/projects/${project.slug}`),
              },
            },
          });
      cursor = payload.meta.nextCursor;
      if (!cursor || seen.has(cursor)) break;
      seen.add(cursor);
    }
  } catch {
    /* Keep the canonical home pages available if the API is temporarily unavailable. */
  }
  return entries;
}
