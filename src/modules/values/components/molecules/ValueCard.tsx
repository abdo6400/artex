import React from 'react';
import { valueIcons } from '../../../../shared/components/atoms/Icons';

interface ValueCardProps {
  index: number;
  title: string;
  desc: string;
}

export const ValueCard: React.FC<ValueCardProps> = ({ index, title, desc }) => {
  const IconComp = valueIcons[index % valueIcons.length];
  const number = String(index + 1).padStart(2, '0');

  return (
    <div
      className="glass-card reveal"
      style={{
        padding: '32px 28px', position: 'relative', overflow: 'hidden', borderRadius: 2,
        transitionDelay: `${index * 0.08}s`,
      }}
    >
      {/* Large gradient number behind */}
      <div style={{
        position: 'absolute', bottom: -16, right: lang === 'ar' ? 'auto' : 8, left: lang === 'ar' ? 8 : 'auto',
        fontFamily: 'var(--font-display)', fontSize: '5rem', fontWeight: 900,
        color: 'rgba(212,168,75,0.06)', lineHeight: 1, userSelect: 'none',
      }}>
        {number}
      </div>

      {/* Icon with spinning ring */}
      <div style={{ position: 'relative', width: 48, height: 48, marginBottom: 20 }}>
        <svg
          className="animate-spin-slow"
          style={{ position: 'absolute', inset: 0 }}
          width="48" height="48" viewBox="0 0 48 48" fill="none"
        >
          <circle cx="24" cy="24" r="22" stroke="rgba(212,168,75,0.3)" strokeWidth="1" strokeDasharray="4 4"/>
        </svg>
        <div style={{
          position: 'absolute', inset: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#d4a84b',
        }}>
          {IconComp && <IconComp />}
        </div>
      </div>

      <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.02em', marginBottom: 8 }}>
        {title}
      </h3>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
        {desc}
      </p>
    </div>
  );
};

// Needed for the watermark — defined here to avoid prop drilling
const lang = typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? 'ar' : 'en';
