import React, { useEffect, useState } from 'react';
import { PortfolioItem } from '../../types';
import { portfolioItems } from '../../constants/portfolioData';

interface LightboxProps {
  item: PortfolioItem;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ item, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(() =>
    portfolioItems.findIndex(p => p.id === item.id)
  );
  const [entering, setEntering] = useState(true);

  const currentItem = portfolioItems[currentIndex] ?? item;

  useEffect(() => {
    setEntering(true);
    const t = setTimeout(() => setEntering(false), 50);
    return () => clearTimeout(t);
  }, [currentIndex]);

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(i => (i - 1 + portfolioItems.length) % portfolioItems.length);
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(i => (i + 1) % portfolioItems.length);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex(i => (i - 1 + portfolioItems.length) % portfolioItems.length);
      if (e.key === 'ArrowRight') setCurrentIndex(i => (i + 1) % portfolioItems.length);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '90vw', maxHeight: '90vh', position: 'relative',
          transform: entering ? 'scale(0.92)' : 'scale(1)',
          opacity: entering ? 0 : 1,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
        }}
      >
        <img
          src={currentItem.img}
          alt={currentItem.alt}
          style={{ maxWidth: '90vw', maxHeight: '75vh', objectFit: 'contain', display: 'block', borderRadius: 2 }}
        />

        {/* Client label */}
        <div style={{ padding: '14px 0 0', color: '#d4a84b', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.85rem' }}>
          {currentItem.client}
          <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: 12 }}>
            {currentIndex + 1} / {portfolioItems.length}
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: -48, right: 0,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#94a3b8', cursor: 'pointer', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Prev arrow */}
        <button
          onClick={goPrev}
          style={{
            position: 'absolute', left: -56, top: '50%', transform: 'translateY(-50%)',
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(18,36,43,0.85)', border: '1px solid rgba(212,168,75,0.3)',
            color: '#d4a84b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          aria-label="Previous"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        {/* Next arrow */}
        <button
          onClick={goNext}
          style={{
            position: 'absolute', right: -56, top: '50%', transform: 'translateY(-50%)',
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(18,36,43,0.85)', border: '1px solid rgba(212,168,75,0.3)',
            color: '#d4a84b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          aria-label="Next"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
