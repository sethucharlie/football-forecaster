import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-auto py-[var(--spacing-lg)] text-center text-[var(--color-text-secondary)] text-sm">
      <p>&copy; {new Date().getFullYear()} Football Forecaster. All rights reserved.</p>
    </footer>
  );
}
