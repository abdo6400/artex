import React from 'react';
import { Lang } from '../../../../shared/types/i18n';
import { t } from '../../../../shared/constants/translations';
import { ServiceCard } from '../molecules/ServiceCard';
import { useScrollReveal } from '../../../../shared/hooks/useScrollReveal';

interface ServicesSectionProps {
  lang: Lang;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ lang }) => {
  const copy = t[lang];
  useScrollReveal();

  return (
    <section id="services" style={{ padding: 'clamp(64px, 8vw, 120px) 24px', background: '#12242B', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '50%', right: lang === 'ar' ? 'auto' : '-0.05em', left: lang === 'ar' ? '-0.05em' : 'auto',
        transform: 'translateY(-50%)',
        fontFamily: 'var(--font-display)', fontSize: 'clamp(10rem, 20vw, 18rem)',
        fontWeight: 900, color: 'rgba(34,211,238,0.025)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
      }}>02</div>

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
        <div className="reveal" style={{ marginBottom: 56 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>{copy.services.label}</div>
          <div className="gold-line" />
          <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#f1f5f9' }}>
            {copy.services.heading}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {copy.services.items.map((svc, i) => (
            <ServiceCard key={svc.title} index={i} title={svc.title} desc={svc.desc} />
          ))}
        </div>
      </div>
    </section>
  );
};
