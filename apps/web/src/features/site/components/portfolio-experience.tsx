"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@artex/i18n";
import { siteContentSchema, type SiteContent } from "@artex/contracts";
import {
  SiteContentContext,
  t,
} from "@/features/portfolio-site/shared/constants/translations";
import { Navbar } from "@/features/portfolio-site/modules/navigation";
import { HeroSection } from "@/features/portfolio-site/modules/hero";
import { AboutSection } from "@/features/portfolio-site/modules/about";
import { ServicesSection } from "@/features/portfolio-site/modules/services";
import { ShowreelSection } from "@/features/portfolio-site/modules/showreel";
import { PortfolioSection } from "@/features/portfolio-site/modules/portfolio";
import { ValuesSection } from "@/features/portfolio-site/modules/values";
import { ClientsSection } from "@/features/portfolio-site/modules/clients";
import { ContactSection } from "@/features/portfolio-site/modules/contact";
import { Footer } from "@/features/portfolio-site/modules/footer";
import type { PortfolioItem } from "@/features/portfolio-site/modules/portfolio/types";

export function PortfolioExperience({
  locale,
  portfolio,
  categories,
  content,
}: {
  locale: Locale;
  portfolio?: PortfolioItem[];
  categories?: string[];
  content?: SiteContent;
}) {
  const router = useRouter();
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <SiteContentContext.Provider value={content ?? siteContentSchema.parse(t)}>
      <div
        style={{
          fontFamily:
            locale === "ar" ? "var(--font-arabic)" : "var(--font-sans)",
        }}
      >
        <Navbar
          lang={locale}
          onToggleLang={() => router.push(locale === "ar" ? "/en" : "/ar")}
          onNavigate={scrollTo}
        />
        <HeroSection lang={locale} onNavigate={scrollTo} />
        <AboutSection lang={locale} />
        <ServicesSection lang={locale} />
        <ShowreelSection lang={locale} />
        <PortfolioSection
          lang={locale}
          items={portfolio}
          categories={categories}
        />
        <ValuesSection lang={locale} />
        <ClientsSection lang={locale} />
        <ContactSection lang={locale} />
        <Footer lang={locale} />
      </div>
    </SiteContentContext.Provider>
  );
}
