import React from 'react';

export default function EmptyState({ message }) {
  return (
    <p className="text-[var(--color-text-secondary)] text-center my-8 md:my-16 text-sm md:text-base">
      {message}
    </p>
  );
}
