import React from 'react';
import { Lang } from '../../../../shared/types/i18n';
import { t } from '../../../../shared/constants/translations';
import { clientsData } from '../../constants/clientsData';

interface ClientsSectionProps {
  lang: Lang;
}

export const ClientsSection: React.FC<ClientsSectionProps> = ({ lang }) => {
  const copy = t[lang];
  const doubled = [...clientsData, ...clientsData];

  return (
    <section style={{ padding: '64px 0', background: '#0D1C22', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', marginBottom: 40 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="section-label" style={{ marginBottom: 8 }}>{copy.clients.label}</div>
          <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {copy.clients.heading}
          </h3>
        </div>
      </div>

      {/* Row 1 — left to right */}
      <div style={{ position: 'relative', overflow: 'hidden', marginBottom: 16 }}>
        <div className="animate-marquee" style={{ display: 'flex', gap: 12, width: 'max-content' }}>
          {doubled.map((c, i) => (
            <div
              key={`row1-${i}`}
              style={{
                padding: '10px 20px', flexShrink: 0,
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 100,
                color: '#94a3b8', fontSize: '0.82rem',
                fontFamily: 'var(--font-display)', letterSpacing: '0.1em',
                fontWeight: 600, textTransform: 'uppercase',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 — right to left */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="animate-marquee-reverse" style={{ display: 'flex', gap: 12, width: 'max-content' }}>
          {[...doubled].reverse().map((c, i) => (
            <div
              key={`row2-${i}`}
              style={{
                padding: '10px 20px', flexShrink: 0,
                background: 'rgba(212,168,75,0.04)',
                border: '1px solid rgba(212,168,75,0.1)',
                borderRadius: 100,
                color: '#64748b', fontSize: '0.82rem',
                fontFamily: 'var(--font-display)', letterSpacing: '0.1em',
                fontWeight: 600, textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
