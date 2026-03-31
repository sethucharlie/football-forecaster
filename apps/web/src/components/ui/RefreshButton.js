import React from 'react';
import { formatLastUpdated } from '../../lib/formatters';

export default function RefreshButton({ onRefresh, isRefreshing, lastUpdated }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className={`p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50 ${
          isRefreshing ? 'animate-spin' : ''
        }`}
        aria-label="Refresh data"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </button>
      {lastUpdated && (
        <span className="text-[var(--color-text-secondary)] text-xs">
          Last updated: {formatLastUpdated(lastUpdated)}
        </span>
      )}
    </div>
  );
}
