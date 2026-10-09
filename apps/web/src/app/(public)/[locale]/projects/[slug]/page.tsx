import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@artex/i18n";
import {
  getPublicProject,
  getPublicSite,
} from "@/features/projects/project-api";
import { ProjectChrome } from "@/features/projects/project-chrome";
import { SITE_NAME, siteUrl } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = await getPublicProject(slug, locale);
  if (!project) return {};
  const canonical = siteUrl(`/${locale}/projects/${slug}`);
  const title = project.seo.title ?? project.title;
  const description = project.seo.description ?? project.summary;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ar: siteUrl(`/ar/projects/${slug}`),
        en: siteUrl(`/en/projects/${slug}`),
        "x-default": siteUrl(`/en/projects/${slug}`),
      },
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      siteName: SITE_NAME,
      ...(project.cover
        ? { images: [{ url: project.cover.url, alt: project.cover.alt }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [project.cover?.url ?? siteUrl(`/${locale}/opengraph-image`)],
    },
  };
}
export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const [project, content] = await Promise.all([
    getPublicProject(slug, locale),
    getPublicSite(),
  ]);
  if (!project) notFound();
  return (
    <ProjectChrome locale={locale} slug={slug} content={content}>
      <main
        style={{ maxWidth: 1160, margin: "0 auto", padding: "130px 24px 80px" }}
      >
        <Link
          href={`/${locale}#portfolio`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#b8861e",
            textDecoration: "none",
            fontSize: "0.88rem",
            fontWeight: 600,
          }}
        >
          {locale === "ar" ? "← العودة إلى الأعمال" : "← Back to portfolio"}
        </Link>
        <p className="section-label" style={{ marginTop: 32 }}>
          {project.category.name} · {project.clientName}
        </p>
        <h1
          className="font-display"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            margin: "12px 0 20px",
            color: "#0f172a",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          {project.title}
        </h1>
        <p
          style={{
            color: "#475569",
            fontSize: "1.2rem",
            lineHeight: 1.7,
            maxWidth: 820,
          }}
        >
          {project.summary}
        </p>
        {project.cover && (
          <Image
            src={project.cover.url}
            alt={project.cover.alt}
            width={project.cover.width ?? 1600}
            height={project.cover.height ?? 1000}
            unoptimized
            priority
            style={{
              width: "100%",
              height: "auto",
              marginTop: 36,
              borderRadius: 18,
              border: "1px solid rgba(201,149,46,0.18)",
              boxShadow: "0 24px 70px rgba(15,23,42,0.08)",
            }}
          />
        )}
        <p
          style={{
            whiteSpace: "pre-line",
            lineHeight: 1.9,
            margin: "44px 0",
            color: "#334155",
            fontSize: "1.05rem",
            maxWidth: 860,
          }}
        >
          {project.description}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: 24,
          }}
        >
          {project.gallery.map((image) => (
            <Image
              key={image.url}
              src={image.url}
              alt={image.alt}
              width={image.width ?? 1200}
              height={image.height ?? 800}
              unoptimized
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 14,
                border: "1px solid rgba(201,149,46,0.15)",
                boxShadow: "0 12px 35px rgba(15,23,42,0.05)",
              }}
            />
          ))}
        </div>
        <Link
          href={`/${locale}#contact`}
          className="btn-primary"
          style={{
            display: "inline-block",
            marginTop: 48,
            padding: "16px 28px",
            textDecoration: "none",
          }}
        >
          {locale === "ar" ? "ابدأ مشروعك معنا" : "Start your project with us"}
        </Link>
      </main>
    </ProjectChrome>
  );
}
