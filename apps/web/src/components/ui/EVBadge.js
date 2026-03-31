import React from 'react';
import { formatEV } from '../../lib/formatters';

export default function EVBadge({ ev }) {
  const isPositive = ev >= 0;
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-bold whitespace-nowrap ${
        isPositive
          ? 'bg-[var(--color-positive)]/10 text-[var(--color-positive)]'
          : 'bg-[var(--color-negative)]/10 text-[var(--color-negative)]'
      }`}
    >
      {formatEV(ev)}
    </span>
  );
}
