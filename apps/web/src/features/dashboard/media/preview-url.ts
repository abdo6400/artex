export function previewUrl(url: string) {
  const siteOrigin = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  try {
    const pathname = url.startsWith("/") ? url : new URL(url).pathname;
    const match = pathname.match(
      /^\/api\/v1\/public\/media\/([a-f0-9-]{36})$/i,
    );
    if (match) return `/api/admin/media/${match[1]}/content`;
    return url.startsWith("/") ? `${siteOrigin}${url}` : url;
  } catch {
    return url;
  }
}
