import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className="w-10 h-10 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
