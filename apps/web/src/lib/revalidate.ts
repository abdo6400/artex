import { revalidatePath, revalidateTag } from "next/cache";

export function revalidatePublicContent(type?: "projects" | "site" | "all") {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/[locale]", "page");
    revalidatePath("/[locale]/projects/[slug]", "page");
    revalidatePath("/sitemap.xml");

    if (!type || type === "projects" || type === "all") {
      revalidateTag("projects", { expire: 0 });
    }
    if (!type || type === "site" || type === "all") {
      revalidateTag("site", { expire: 0 });
    }
  } catch {
    // Ignore errors when running outside a request context or during builds
  }
}
