import { isLocale } from "@artex/i18n";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { PortfolioExperience } from "@/features/site/components/portfolio-experience";
import {
  publicProjectListResponseSchema,
  siteContentResponseSchema,
} from "@artex/contracts";
import {
  SITE_DESCRIPTION,
  SITE_DESCRIPTION_AR,
  SITE_NAME,
  siteUrl,
} from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const description = locale === "ar" ? SITE_DESCRIPTION_AR : SITE_DESCRIPTION;
  return {
    title: locale === "ar" ? "آرتكس برودكشن" : SITE_NAME,
    description,
    alternates: {
      canonical: siteUrl(`/${locale}`),
      languages: {
        ar: siteUrl("/ar"),
        en: siteUrl("/en"),
        "x-default": siteUrl("/en"),
      },
    },
    openGraph: {
      title: locale === "ar" ? "آرتكس برودكشن" : SITE_NAME,
      description,
      type: "website",
      url: siteUrl(`/${locale}`),
      locale: locale === "ar" ? "ar_EG" : "en_US",
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_EG"],
      siteName: SITE_NAME,
      images: [
        {
          url: siteUrl(`/${locale}/opengraph-image`),
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description,
      images: [siteUrl(`/${locale}/opengraph-image`)],
    },
  };
}

async function getPortfolio(locale: "ar" | "en") {
  const base =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3000";
  try {
    const response = await fetch(
      `${base}/api/v1/public/projects?locale=${locale}&limit=50`,
      { next: { revalidate: 300 } },
    );
    if (!response.ok) return undefined;
    const payload = publicProjectListResponseSchema.parse(
      await response.json(),
    );
    const categoryNames = new Map<string, string>();
    for (const project of payload.data)
      categoryNames.set(project.category.slug, project.category.name);
    const entries = [...categoryNames.entries()];
    return {
      categories: [
        locale === "ar" ? "الكل" : "All",
        ...entries.map(([, name]) => name),
      ],
      items: payload.data.map((project) => ({
        id: project.id,
        slug: project.slug,
        category:
          entries.findIndex(([slug]) => slug === project.category.slug) + 1,
        client: project.clientName,
        img: project.cover?.url ?? "/logo.svg",
        alt: project.cover?.alt ?? project.title,
      })),
    };
  } catch {
    return undefined;
  }
}

export default async function HomePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const portfolio = await getPortfolio(locale);
  await connection();
  const base = process.env.API_INTERNAL_URL ?? "http://localhost:3000";
  const siteResponse = await fetch(`${base}/api/v1/public/site`, {
    next: { revalidate: 300 },
  }).catch(() => null);
  const site = siteResponse?.ok
    ? siteContentResponseSchema.safeParse(await siteResponse.json())
    : undefined;
  if (process.env.NODE_ENV === "production" && !site?.success)
    throw new Error("Published site content unavailable");
  const content = site?.success ? site.data.data : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl("/")}#organization`,
        name: SITE_NAME,
        url: siteUrl("/"),
        logo: siteUrl(content?.settings.logoUrl ?? "/logo.svg"),
        ...(content
          ? {
              telephone: content.settings.phones,
              sameAs: content.settings.socialLinks
                .map((social) => social.url)
                .filter((url) => /^https?:\/\//i.test(url)),
              address: {
                "@type": "PostalAddress",
                streetAddress: content[locale].contact.address,
                addressCountry: "EG",
              },
            }
          : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl("/")}#website`,
        name: SITE_NAME,
        url: siteUrl(`/${locale}`),
        inLanguage: locale === "ar" ? "ar-EG" : "en-US",
        publisher: { "@id": `${siteUrl("/")}#organization` },
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <PortfolioExperience
        locale={locale}
        content={content}
        portfolio={portfolio?.items ?? []}
        categories={portfolio?.categories}
      />
    </>
  );
}
