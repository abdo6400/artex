import React, { useState } from 'react';
import { ServiceIcons } from '../../../../shared/components/atoms/Icons';

interface ServiceCardProps {
  index: number;
  title: string;
  desc: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ index, title, desc }) => {
  const [hovered, setHovered] = useState(false);
  const IconComp = ServiceIcons[index % ServiceIcons.length];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="reveal"
      style={{
        padding: '36px 32px',
        background: hovered ? 'rgba(30,62,98,0.25)' : 'rgba(11,25,44,0.6)',
        border: `1px solid ${hovered ? 'rgba(212,168,75,0.3)' : 'rgba(255,255,255,0.06)'}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 60px rgba(212,168,75,0.12)' : 'none',
        cursor: 'default',
        transitionDelay: `${index * 0.08}s`,
      }}
    >
      {/* Gradient border glow on hover */}
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(135deg, rgba(212,168,75,0.05) 0%, transparent 60%)',
        }} />
      )}

      {/* Index number watermark */}
      <div style={{
        position: 'absolute', top: 20, right: 24,
        fontFamily: 'var(--font-display)', fontSize: '2.5rem',
        fontWeight: 900, color: hovered ? 'rgba(212,168,75,0.12)' : 'rgba(212,168,75,0.07)',
        lineHeight: 1, transition: 'color 0.3s',
      }}>
        0{index + 1}
      </div>

      {/* Hexagon-shaped icon container */}
      <div style={{
        width: 52, height: 52, marginBottom: 20,
        background: hovered ? 'rgba(212,168,75,0.12)' : 'rgba(212,168,75,0.06)',
        border: `1px solid ${hovered ? 'rgba(212,168,75,0.5)' : 'rgba(212,168,75,0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#d4a84b', transition: 'all 0.3s ease',
        boxShadow: hovered ? '0 0 20px rgba(212,168,75,0.2)' : 'none',
        clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
      }}>
        {IconComp && <IconComp />}
      </div>

      <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.02em', marginBottom: 12 }}>
        {title}
      </h3>
      <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{desc}</p>

      {/* Hover slide-in CTA */}
      <div style={{
        marginTop: 20,
        display: 'flex', alignItems: 'center', gap: 6,
        color: '#d4a84b', fontSize: '0.78rem', letterSpacing: '0.1em',
        fontFamily: 'var(--font-display)', textTransform: 'uppercase',
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'translateX(0)' : 'translateX(-8px)',
        transition: 'all 0.3s ease',
      }}>
        {hovered && 'Learn More'}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </div>
  );
};
