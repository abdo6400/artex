import React from 'react';
import { Lang } from '../../../../shared/types/i18n';
import { t } from '../../../../shared/constants/translations';
import { VisionMissionCard } from '../molecules/VisionMissionCard';
import { useScrollReveal } from '../../../../shared/hooks/useScrollReveal';

interface AboutSectionProps {
  lang: Lang;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ lang }) => {
  const copy = t[lang];
  useScrollReveal();

  return (
    <section id="about" style={{ padding: 'clamp(64px, 8vw, 120px) 24px', background: '#080f1c', position: 'relative', overflow: 'hidden' }}>
      {/* Section watermark */}
      <div style={{
        position: 'absolute', top: '50%', left: lang === 'ar' ? 'auto' : '-0.1em', right: lang === 'ar' ? '-0.1em' : 'auto',
        transform: 'translateY(-50%)',
        fontFamily: 'var(--font-display)', fontSize: 'clamp(10rem, 20vw, 18rem)',
        fontWeight: 900, color: 'rgba(212,168,75,0.025)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
        letterSpacing: '-0.05em',
      }}>
        01
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 64, alignItems: 'start' }}>
          <div className="reveal-left">
            <div className="section-label" style={{ marginBottom: 16 }}>{copy.about.label}</div>
            <div className="gold-line" />
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#f1f5f9', lineHeight: 1.05, marginBottom: 24 }}>
              {copy.about.heading}
            </h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: 16 }}>{copy.about.who}</p>
            <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '0.95rem' }}>{copy.about.what}</p>
          </div>

          <div className="reveal-right" style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
            {/* Connecting line */}
            <div style={{ position: 'absolute', left: lang === 'ar' ? 'auto' : -1, right: lang === 'ar' ? -1 : 'auto', top: 40, bottom: 40, width: 1, background: 'linear-gradient(to bottom, rgba(212,168,75,0.3), rgba(34,211,238,0.3))' }} />
            <VisionMissionCard label={copy.about.visionLabel} text={copy.about.vision} lang={lang} icon="vision" />
            <VisionMissionCard label={copy.about.missionLabel} text={copy.about.mission} lang={lang} icon="mission" />
          </div>
        </div>
      </div>
    </section>
  );
};
