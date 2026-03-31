import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import LeagueSelector from './LeagueSelector';

const NAV_LINKS = [
  { to: '/', label: 'Value Bets' },
  { to: '/performance', label: 'Performance' },
  { to: '/predictions', label: 'Predictions' },
  { to: '/paper-bets', label: 'Paper Bets' },
  { to: '/how-it-works', label: 'How It Works' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-[var(--color-primary)]'
        : 'text-[var(--color-text-secondary)] hover:text-white'
    }`;

  return (
    <nav className="bg-[var(--color-bg)] border-b border-[var(--color-border)] h-16 flex items-center justify-between px-[var(--spacing-lg)] sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="text-white font-bold text-lg flex items-center gap-2 no-underline">
        <span className="text-[var(--color-primary)]">⚽</span>
        <span>Football Forecaster</span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">
        {NAV_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
            {link.label}
          </NavLink>
        ))}
        <LeagueSelector />
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-white p-2 cursor-pointer"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {mobileOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[var(--color-bg)] border-b border-[var(--color-border)] flex flex-col p-[var(--spacing-lg)] gap-4 md:hidden z-50">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={linkClass}
              end={link.to === '/'}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <LeagueSelector />
        </div>
      )}
    </nav>
  );
}
