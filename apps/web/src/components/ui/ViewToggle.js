import React from 'react';

export default function ViewToggle({ isDetailedView, onToggle }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
      <button
        onClick={() => onToggle(false)}
        className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
          !isDetailedView
            ? 'bg-[var(--color-primary)] text-[#1A1A1D]'
            : 'bg-transparent text-[var(--color-text-secondary)] hover:text-white'
        }`}
      >
        Simple
      </button>
      <button
        onClick={() => onToggle(true)}
        className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
          isDetailedView
            ? 'bg-[var(--color-primary)] text-[#1A1A1D]'
            : 'bg-transparent text-[var(--color-text-secondary)] hover:text-white'
        }`}
      >
        Detailed
      </button>
    </div>
  );
}
