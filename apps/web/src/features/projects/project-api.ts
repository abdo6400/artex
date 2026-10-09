import {
  publicProjectDetailResponseSchema,
  siteContentResponseSchema,
  type Locale,
} from "@artex/contracts";

export async function getPublicProject(slug: string, locale: Locale) {
  const base = process.env.API_INTERNAL_URL ?? "http://localhost:3000";
  const response = await fetch(
    `${base}/api/v1/public/projects/${encodeURIComponent(slug)}?locale=${locale}`,
    { next: { revalidate: 300 }, signal: AbortSignal.timeout(10_000) },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Project service unavailable");
  return publicProjectDetailResponseSchema.parse(await response.json()).data;
}
export async function getPublicSite() {
  const base = process.env.API_INTERNAL_URL ?? "http://localhost:3000";
  const response = await fetch(`${base}/api/v1/public/site`, {
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  if (!response?.ok) return undefined;
  return siteContentResponseSchema.parse(await response.json()).data;
}
