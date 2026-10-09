import React from "react";
import { Lang } from "../../../../shared/types/i18n";
import { useSiteCopy } from "../../../../shared/constants/translations";
import { usePortfolioFilter } from "../../hooks/usePortfolioFilter";
import { CategoryFilter } from "../atoms/CategoryFilter";
import { PortfolioCard } from "../molecules/PortfolioCard";
import { Lightbox } from "./Lightbox";
import { portfolioItems } from "../../constants/portfolioData";
import { PortfolioItem } from "../../types";

interface PortfolioSectionProps {
  lang: Lang;
  items?: PortfolioItem[];
  categories?: string[];
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  lang,
  items = portfolioItems,
  categories,
}) => {
  const copy = useSiteCopy(lang);
  const categoryLabels = categories ?? copy.portfolio.categories;
  const {
    activeFilter,
    setActiveFilter,
    lightboxItem,
    setLightboxItem,
    filteredPortfolio,
  } = usePortfolioFilter(items);

  return (
    <section
      id="portfolio"
      className="section-surface section-surface-dark"
      style={{ padding: "clamp(64px, 8vw, 120px) 24px", background: "#0D1C22" }}
    >
      <div
        className="section-container portfolio-container"
        style={{ maxWidth: 1280, margin: "0 auto" }}
      >
        <div
          className="portfolio-heading"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 24,
            marginBottom: 48,
          }}
        >
          <div>
            <div className="section-label" style={{ marginBottom: 16 }}>
              {copy.portfolio.label}
            </div>
            <div className="gold-line" />
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "#f1f5f9",
              }}
            >
              {copy.portfolio.heading}
            </h2>
          </div>

          {items.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {categoryLabels.map((cat, i) => (
                <CategoryFilter
                  key={cat}
                  label={cat}
                  isActive={activeFilter === i}
                  onClick={() => setActiveFilter(i)}
                />
              ))}
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="portfolio-empty">
            <span aria-hidden="true">✦</span>
            <h3>
              {lang === "ar"
                ? "مشاريعنا قيد الإضافة"
                : "Projects are being added"}
            </h3>
            <p>
              {lang === "ar"
                ? "ستظهر المشاريع هنا فور نشرها من لوحة التحكم."
                : "Published projects will appear here automatically from the dashboard."}
            </p>
            <a href="#contact" className="btn-secondary">
              {lang === "ar" ? "ابدأ مشروعك معنا" : "Start a project with us"}
            </a>
          </div>
        ) : (
          <div
            className="portfolio-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {filteredPortfolio.map((item) => (
              <PortfolioCard
                key={item.id}
                item={item}
                href={item.slug ? `/${lang}/projects/${item.slug}` : undefined}
                actionLabel={lang === "ar" ? "عرض المشروع" : "View project"}
                categoryName={categoryLabels[item.category] ?? ""}
                onClick={() => setLightboxItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <Lightbox
          item={lightboxItem}
          items={items}
          onClose={() => setLightboxItem(null)}
        />
      )}
    </section>
  );
};
