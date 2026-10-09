import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { isLocale, locales } from "@artex/i18n";
import "../../globals.css";
import { connection } from "next/server";
import { SITE_DESCRIPTION, SITE_NAME, siteOrigin } from "@/lib/seo";
import { getPublicSite } from "@/features/projects/project-api";
import { generateThemeCss } from "@/lib/theme";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Exhibition and event production",
  keywords: [
    "exhibition booth design Egypt",
    "event production Cairo",
    "trade show stands",
    "retail displays",
    "storefront fabrication",
    "Artex Production",
  ],
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false, address: false, email: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  await connection();
  if (!isLocale(locale)) notFound();

  const site = await getPublicSite();
  const themeCss = generateThemeCss(site?.settings?.theme);

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <head>
        {themeCss ? (
          <style
            id="artex-theme"
            dangerouslySetInnerHTML={{ __html: themeCss }}
          />
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
