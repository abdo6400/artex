import React from 'react';
import { Lang } from '../../../../shared/types/i18n';
import { t } from '../../../../shared/constants/translations';
import { ValueCard } from '../molecules/ValueCard';

interface ValuesSectionProps {
  lang: Lang;
}

export const ValuesSection: React.FC<ValuesSectionProps> = ({ lang }) => {
  const copy = t[lang];

  return (
    <section id="values" style={{ padding: 'clamp(64px, 8vw, 120px) 24px', background: '#080f1c' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 56 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>{copy.values.label}</div>
          <div className="gold-line" />
          <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#f1f5f9' }}>
            {copy.values.heading}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {copy.values.items.map((val, i) => (
            <ValueCard key={val.title} index={i} title={val.title} desc={val.desc} />
          ))}
        </div>
      </div>
    </section>
  );
};
