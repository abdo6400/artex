import React from 'react';
import { Lang } from '../../../../shared/types/i18n';
import { t } from '../../../../shared/constants/translations';
import { HeroStats } from '../molecules/HeroStats';

interface HeroSectionProps {
  lang: Lang;
  onNavigate: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ lang, onNavigate }) => {
  const copy = t[lang];

  return (
    <section id="home" style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden', background: '#060f1c' }}>
      {/* Background image with Ken Burns */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1600&h=900&fit=crop&auto=format"
          alt="Exhibition hall"
          className="animate-kenburns"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(6,15,28,0.97) 0%, rgba(11,25,44,0.82) 50%, rgba(30,62,98,0.72) 100%)' }} />
      </div>

      {/* Grid lines */}
      <div className="grid-lines" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />

      {/* Decorative accent lines */}
      <div style={{ position: 'absolute', top: '20%', right: lang === 'ar' ? 'auto' : '8%', left: lang === 'ar' ? '8%' : 'auto', width: 1, height: '40%', background: 'linear-gradient(to bottom, transparent, rgba(212,168,75,0.5), transparent)' }} />
      <div style={{ position: 'absolute', bottom: '15%', left: lang === 'ar' ? 'auto' : '5%', right: lang === 'ar' ? '5%' : 'auto', width: '15%', height: 1, background: 'linear-gradient(to right, transparent, rgba(34,211,238,0.5), transparent)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '120px 24px 80px', width: '100%' }}>
        <div style={{ maxWidth: 760 }}>
          {/* Floating badge */}
          <div className="animate-fadeInUp" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, position: 'relative' }}>
            <span style={{
              position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px 6px 10px',
              background: 'rgba(212,168,75,0.08)',
              border: '1px solid rgba(212,168,75,0.3)',
              borderRadius: 100, fontSize: '0.72rem', color: '#d4a84b',
              fontFamily: 'var(--font-display)', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              <span style={{ position: 'relative', width: 8, height: 8, display: 'inline-block' }}>
                <span className="animate-pulse-ring" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(212,168,75,0.5)' }} />
                <span style={{ position: 'relative', display: 'block', width: 8, height: 8, borderRadius: '50%', background: '#d4a84b' }} />
              </span>
              {lang === 'ar' ? 'الوكالة الرائدة في مصر' : "Egypt's #1 Exhibition Agency"}
            </span>
          </div>

          <div className="section-label animate-fadeInUp" style={{ marginBottom: 16 }}>{copy.hero.tagline}</div>
          <h1 className="font-display animate-fadeInUp" style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', fontWeight: 900, lineHeight: 0.92, letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: 24, animationDelay: '0.1s', color: '#f1f5f9' }}>
            <span className="text-gold-gradient">{copy.hero.headline.split(' ').slice(0, 2).join(' ')}</span>
            <br />
            <span style={{ color: '#f1f5f9' }}>{copy.hero.headline.split(' ').slice(2).join(' ')}</span>
          </h1>
          <p className="animate-fadeInUp" style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: '#94a3b8', maxWidth: 560, lineHeight: 1.7, marginBottom: 40, animationDelay: '0.2s' }}>
            {copy.hero.sub}
          </p>
          <div className="animate-fadeInUp" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animationDelay: '0.3s' }}>
            <button
              onClick={() => onNavigate('portfolio')}
              className="btn-primary"
              style={{ padding: '14px 32px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 2, fontFamily: 'inherit', position: 'relative', zIndex: 1 }}
            >
              <span style={{ position: 'relative', zIndex: 1 }}>{copy.hero.cta1}</span>
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="btn-secondary"
              style={{ padding: '14px 32px', cursor: 'pointer', fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 2, fontFamily: 'inherit' }}
            >
              {copy.hero.cta2}
            </button>
          </div>
        </div>

        <HeroStats lang={lang} />
      </div>

      {/* Scroll indicator */}
      <div className="animate-bounce-down" style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: '0.6rem', color: '#64748b', letterSpacing: '0.2em', textTransform: 'uppercase' }}>scroll</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a84b" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
    </section>
  );
};
