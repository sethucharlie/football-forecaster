import React from 'react';
import { formatMarketName } from '../../lib/formatters';

export default function MarketBadge({ marketCode }) {
  return (
    <span className="bg-[#2A2A2D] text-[var(--color-text)] rounded px-2 py-1 text-xs border border-[var(--color-border)] whitespace-nowrap">
      {formatMarketName(marketCode)}
    </span>
  );
}
