import React from 'react';

interface CategoryFilterProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '8px 20px',
      background: isActive ? '#d4a84b' : 'rgba(255,255,255,0.04)',
      color: isActive ? '#12242B' : '#94a3b8',
      border: isActive ? '1px solid #d4a84b' : '1px solid rgba(255,255,255,0.08)',
      cursor: 'pointer',
      fontSize: '0.8rem',
      letterSpacing: '0.06em',
      fontWeight: isActive ? 700 : 400,
      borderRadius: 2,
      transition: 'all 0.2s ease',
    }}
  >
    {label}
  </button>
);
