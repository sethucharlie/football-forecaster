import React from 'react';
import { LEAGUES } from '../../lib/leagues';
import { useLeague } from '../../context/LeagueContext';

export default function LeagueSelector() {
  const { league, setLeague } = useLeague();

  return (
    <select
      value={league}
      onChange={(e) => setLeague(e.target.value)}
      className="bg-[var(--color-card)] text-[var(--color-text)] text-sm border border-[var(--color-border)] rounded-lg px-3 py-1.5 outline-none focus:border-[var(--color-primary)] transition-colors cursor-pointer"
    >
      {LEAGUES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.name}
        </option>
      ))}
    </select>
  );
}
