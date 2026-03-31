import React from 'react';
import { formatEdge } from '../../lib/formatters';

export default function EdgeBadge({ edge }) {
  const isPositive = edge >= 0;
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-bold whitespace-nowrap ${
        isPositive
          ? 'bg-[var(--color-positive)]/10 text-[var(--color-positive)]'
          : 'bg-[var(--color-negative)]/10 text-[var(--color-negative)]'
      }`}
    >
      {formatEdge(edge)}
    </span>
  );
}
