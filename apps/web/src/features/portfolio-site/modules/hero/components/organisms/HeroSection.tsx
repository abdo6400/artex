import React from "react";
import Image from "next/image";
import { Lang } from "../../../../shared/types/i18n";
import {
  useSiteCopy,
  useSiteSettings,
} from "../../../../shared/constants/translations";
import { HeroStats } from "../molecules/HeroStats";

interface HeroSectionProps {
  lang: Lang;
  onNavigate: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  onNavigate,
}) => {
  const copy = useSiteCopy(lang);
  const settings = useSiteSettings();
  const headline = copy.hero.headline.split(" ");

  return (
    <section id="home" className="hero-modern">
      <div className="hero-grid-lines" aria-hidden="true" />

      <div className="hero-shell">
        <div className="hero-copy">
          <div className="hero-badge animate-fadeInUp">
            <span aria-hidden="true" />
            {lang === "ar"
              ? "الوكالة الرائدة في مصر"
              : "Egypt's exhibition production partner"}
          </div>

          <div className="section-label animate-fadeInUp">
            {copy.hero.tagline}
          </div>

          <h1 className="font-display animate-fadeInUp">
            <span className="text-gold-gradient">
              {headline.slice(0, 2).join(" ")}
            </span>
            <span>{headline.slice(2).join(" ")}</span>
          </h1>

          <p className="hero-intro animate-fadeInUp">{copy.hero.sub}</p>

          <div className="hero-actions animate-fadeInUp">
            <button
              type="button"
              onClick={() => onNavigate("portfolio")}
              className="btn-primary"
            >
              <span>{copy.hero.cta1}</span>
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("contact")}
              className="btn-secondary"
            >
              {copy.hero.cta2}
            </button>
          </div>

          <HeroStats lang={lang} />
        </div>

        <div className="hero-visual animate-fadeInUp">
          <Image
            fill
            sizes="(max-width: 900px) 100vw, 48vw"
            priority
            src={settings.heroImageUrl}
            unoptimized={
              !settings.heroImageUrl.startsWith(
                "https://images.unsplash.com/",
              ) && !settings.heroImageUrl.startsWith("/")
            }
            alt="Artex exhibition production"
            className="hero-visual-image"
          />
          <div className="hero-visual-shade" />
          <span className="hero-visual-number" aria-hidden="true">
            01
          </span>
          <div className="hero-visual-caption">
            <span>{lang === "ar" ? "من الفكرة" : "FROM CONCEPT"}</span>
            <strong>{lang === "ar" ? "إلى الواقع" : "TO REALITY"}</strong>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="hero-scroll-cue"
        onClick={() => onNavigate("about")}
        aria-label={lang === "ar" ? "انتقل إلى من نحن" : "Scroll to about"}
      >
        <span>{lang === "ar" ? "اكتشف" : "DISCOVER"}</span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </button>
    </section>
  );
};
