import React from 'react';
import { Lang } from '../../../../shared/types/i18n';
import { t } from '../../../../shared/constants/translations';
import { usePortfolioFilter } from '../../hooks/usePortfolioFilter';
import { CategoryFilter } from '../atoms/CategoryFilter';
import { PortfolioCard } from '../molecules/PortfolioCard';
import { Lightbox } from './Lightbox';

interface PortfolioSectionProps {
  lang: Lang;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ lang }) => {
  const copy = t[lang];
  const {
    activeFilter,
    setActiveFilter,
    lightboxItem,
    setLightboxItem,
    filteredPortfolio,
  } = usePortfolioFilter();

  return (
    <section id="portfolio" style={{ padding: 'clamp(64px, 8vw, 120px) 24px', background: '#060f1c' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24, marginBottom: 48 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 16 }}>{copy.portfolio.label}</div>
            <div className="gold-line" />
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#f1f5f9' }}>
              {copy.portfolio.heading}
            </h2>
          </div>

          {/* Filter Categories */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {copy.portfolio.categories.map((cat, i) => (
              <CategoryFilter
                key={cat}
                label={cat}
                isActive={activeFilter === i}
                onClick={() => setActiveFilter(i)}
              />
            ))}
          </div>
        </div>

        {/* Portfolio Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {filteredPortfolio.map(item => (
            <PortfolioCard
              key={item.id}
              item={item}
              categoryName={copy.portfolio.categories[item.category] ?? ''}
              onClick={() => setLightboxItem(item)}
            />
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
      )}
    </section>
  );
};
