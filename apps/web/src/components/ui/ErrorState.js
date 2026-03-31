import React from 'react';

export default function ErrorState({ message = 'Unable to load data. Please try again.', onRetry }) {
  return (
    <div className="border border-[var(--color-negative)] rounded-lg p-[var(--spacing-sm)] bg-[var(--color-card)] flex flex-col items-center gap-3 my-8">
      <span className="text-2xl">⚠️</span>
      <p className="text-[var(--color-text-secondary)] text-sm text-center">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="border border-white text-white hover:bg-white/10 rounded px-4 py-2 text-sm transition-colors cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
}
