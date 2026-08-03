import { useState } from 'react';
import { portfolioItems } from '../constants/portfolioData';
import { PortfolioItem } from '../types';

export function usePortfolioFilter() {
  const [activeFilter, setActiveFilter] = useState<number>(0);
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);

  const filteredPortfolio = activeFilter === 0
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeFilter);

  return {
    activeFilter,
    setActiveFilter,
    lightboxItem,
    setLightboxItem,
    filteredPortfolio,
  };
}
