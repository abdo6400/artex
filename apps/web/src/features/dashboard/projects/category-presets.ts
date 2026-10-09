export type CategoryPreset = {
  slug: string;
  nameAr: string;
  nameEn: string;
};

export const CATEGORY_PRESETS: CategoryPreset[] = [
  {
    slug: "exhibitions",
    nameAr: "بوثات المعارض",
    nameEn: "Exhibition Booths",
  },
  {
    slug: "retail-kiosks",
    nameAr: "واجهات ومنافذ بيع",
    nameEn: "Retail & Kiosks",
  },
  {
    slug: "outdoor-events",
    nameAr: "فعاليات خارجية",
    nameEn: "Outdoor & Events",
  },
  {
    slug: "product-displays",
    nameAr: "منصات عرض المنتجات",
    nameEn: "Product Displays",
  },
  {
    slug: "event-styling",
    nameAr: "تجهيز الفعاليات",
    nameEn: "Event Styling",
  },
];

/**
 * Creates a URL-friendly slug.
 * If text contains Latin characters, slugifies them.
 * If it's purely non-Latin (e.g. Arabic), uses client or fallback with timestamp.
 */
export function generateProjectSlug(titleEn?: string, client?: string): string {
  const parts = [client, titleEn].filter(Boolean).join(" ");
  const source = parts || titleEn || client || "";
  const cleaned = source
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (cleaned.length >= 2) {
    return cleaned;
  }

  return "";
}
