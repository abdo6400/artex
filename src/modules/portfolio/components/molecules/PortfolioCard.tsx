import React from 'react';
import { PortfolioItem } from '../../types';

interface PortfolioCardProps {
  item: PortfolioItem;
  categoryName: string;
  onClick: () => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ item, categoryName, onClick }) => (
  <div
    className="portfolio-card"
    onClick={onClick}
    style={{
      position: 'relative', overflow: 'hidden',
      aspectRatio: '4/3', cursor: 'pointer',
      background: '#0b192c',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 2,
    }}
  >
    {/* Category pill - top corner */}
    <div style={{
      position: 'absolute', top: 12, left: 12, zIndex: 2,
      padding: '4px 10px',
      background: 'rgba(212,168,75,0.15)',
      border: '1px solid rgba(212,168,75,0.35)',
      borderRadius: 100,
      fontSize: '0.65rem', color: '#d4a84b',
      fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase',
    }}>
      {categoryName}
    </div>

    <img
      src={item.img}
      alt={item.alt}
      loading="lazy"
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
    />

    {/* Gradient overlay */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(to top, rgba(6,15,28,0.97) 0%, rgba(6,15,28,0.3) 50%, transparent 100%)',
    }} />

    {/* Client name slides up from bottom */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '20px 20px 20px',
      transform: 'translateY(0)',
      transition: 'transform 0.3s ease',
    }}>
      <div className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
        {item.client}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        color: '#d4a84b', fontSize: '0.7rem', letterSpacing: '0.1em',
        fontFamily: 'var(--font-display)', textTransform: 'uppercase', opacity: 0.8,
      }}>
        View Project
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </div>
  </div>
);
