export const SITE_NAME = "Artex Production";
export const SITE_DESCRIPTION =
  "Exhibition booth design, event production, retail displays, and storefront fabrication in Egypt.";
export const SITE_DESCRIPTION_AR =
  "تصميم وتنفيذ بوثات المعارض وتجهيز الفعاليات وواجهات المتاجر في مصر.";

export function siteOrigin() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
}

export function siteUrl(path = "/") {
  return new URL(path, `${siteOrigin()}/`).toString();
}
