import { useState } from "react";
import { portfolioItems } from "../constants/portfolioData";
import { PortfolioItem } from "../types";

export function usePortfolioFilter(items: PortfolioItem[] = portfolioItems) {
  const [activeFilter, setActiveFilter] = useState<number>(0);
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);

  const filteredPortfolio =
    activeFilter === 0
      ? items
      : items.filter((item) => item.category === activeFilter);

  return {
    activeFilter,
    setActiveFilter,
    lightboxItem,
    setLightboxItem,
    filteredPortfolio,
  };
}
