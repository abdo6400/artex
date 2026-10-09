"use client";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  siteContentSchema,
  type SiteContent,
  type Locale,
} from "@artex/contracts";
import {
  SiteContentContext,
  t,
} from "@/features/portfolio-site/shared/constants/translations";
import { Navbar } from "@/features/portfolio-site/modules/navigation";
import { Footer } from "@/features/portfolio-site/modules/footer";

export function ProjectChrome({
  locale,
  slug,
  content,
  children,
}: {
  locale: Locale;
  slug: string;
  content?: SiteContent;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <SiteContentContext.Provider value={content ?? siteContentSchema.parse(t)}>
      <Navbar
        lang={locale}
        onNavigate={(id) => router.push(`/${locale}#${id}`)}
        onToggleLang={() =>
          router.push(`/${locale === "ar" ? "en" : "ar"}/projects/${slug}`)
        }
      />
      {children}
      <Footer lang={locale} />
    </SiteContentContext.Provider>
  );
}
