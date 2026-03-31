import React from 'react';
import { formatKickoff, formatOdds, formatPercent, formatLambda } from '../../lib/formatters';
import MarketBadge from '../ui/MarketBadge';
import EdgeBadge from '../ui/EdgeBadge';
import EVBadge from '../ui/EVBadge';

/**
 * ValueBetCard — Mobile card view for a single value bet opportunity.
 * Props match Architecture §3 — Cards.
 */
export default function ValueBetCard({
  homeTeam,
  awayTeam,
  kickoffUtc,
  market,
  oddsDecimal,
  modelProbability,
  impliedProbability,
  edge,
  ev,
  lambdaHome,
  lambdaAway,
  isDetailedView,
}) {
  return (
    <div className="bg-[var(--color-card)] rounded-lg p-[var(--spacing-sm)] shadow-sm border border-[var(--color-border)] flex flex-col gap-[var(--spacing-sm)]">
      {/* Header: Teams + Kickoff */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white font-medium text-sm">{homeTeam} vs {awayTeam}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">{formatKickoff(kickoffUtc)}</p>
        </div>
        <EdgeBadge edge={edge} />
      </div>

      {/* Body: Market + Odds */}
      <div className="flex items-center gap-2 flex-wrap">
        <MarketBadge marketCode={market} />
        <span className="text-white font-bold text-sm">{formatOdds(oddsDecimal)}</span>
      </div>

      {/* Detailed fields */}
      {isDetailedView && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs border-t border-[var(--color-border)] pt-[var(--spacing-sm)]">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Model Prob</span>
            <span className="text-white">{formatPercent(modelProbability)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Implied Prob</span>
            <span className="text-white">{formatPercent(impliedProbability)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">EV</span>
            <EVBadge ev={ev} />
          </div>
          {lambdaHome != null && lambdaAway != null && (
            <>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">λ Home</span>
                <span className="text-white">{formatLambda(lambdaHome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">λ Away</span>
                <span className="text-white">{formatLambda(lambdaAway)}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
