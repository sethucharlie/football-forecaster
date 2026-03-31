import React from 'react';
import { formatKickoff, formatPercent, formatLambda } from '../../lib/formatters';
import MarketBadge from '../ui/MarketBadge';
import EdgeBadge from '../ui/EdgeBadge';
import EVBadge from '../ui/EVBadge';

/**
 * MatchCard — Mobile card view for a prediction match.
 * Displays all markets for a single fixture.
 */
export default function MatchCard({
  homeTeam,
  awayTeam,
  kickoffUtc,
  markets,
  isDetailedView,
}) {
  return (
    <div className="bg-[var(--color-card)] rounded-lg p-[var(--spacing-sm)] shadow-sm border border-[var(--color-border)] flex flex-col gap-[var(--spacing-sm)]">
      {/* Header */}
      <div>
        <p className="text-white font-medium text-sm">{homeTeam} vs {awayTeam}</p>
        <p className="text-xs text-[var(--color-text-secondary)]">{formatKickoff(kickoffUtc)}</p>
      </div>

      {/* Markets */}
      {markets.map((m, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-1 border-t border-[var(--color-border)] pt-[var(--spacing-sm)]"
        >
          <div className="flex items-center justify-between mb-2">
            <MarketBadge marketCode={m.market} />
            <EdgeBadge edge={m.edge} />
          </div>
          <div className="flex items-center justify-between mb-1 pb-2 border-b border-[var(--color-border)]/50">
            <span className="text-[var(--color-text-secondary)] text-xs">Recommendation</span>
            <span className={`text-xs font-bold px-2 py-1 rounded bg-[var(--color-card)] border ${m.edge > 0 ? 'text-[var(--color-positive)] border-[var(--color-positive)]/20' : 'text-[var(--color-text-secondary)] border-[var(--color-border)]'}`}>
              {m.edge > 0 ? "VALUE" : "PASS"}
            </span>
          </div>

          {isDetailedView && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-1">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">λ Home</span>
                <span className="text-white">{formatLambda(m.lambda_home)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">λ Away</span>
                <span className="text-white">{formatLambda(m.lambda_away)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Model Prob</span>
                <span className="text-white">{formatPercent(m.model_probability)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Implied Prob</span>
                <span className="text-white">{formatPercent(m.odds_implied_probability)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">EV</span>
                <EVBadge ev={m.ev} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
