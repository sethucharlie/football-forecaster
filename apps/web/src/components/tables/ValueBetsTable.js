import React from 'react';
import { formatKickoff, formatOdds, formatPercent, formatLambda } from '../../lib/formatters';
import MarketBadge from '../ui/MarketBadge';
import EdgeBadge from '../ui/EdgeBadge';
import EVBadge from '../ui/EVBadge';

/**
 * ValueBetsTable — Desktop table view for value bets.
 * Simple columns: Teams, Kickoff, Market, Odds, Edge
 * Detailed columns: + Implied Prob, Model Prob, Edge, EV, Lambda (Home/Away)
 */
export default function ValueBetsTable({ valueBets, isDetailedView }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm md:text-base">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Match</th>
            <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Kickoff</th>
            <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Market</th>
            <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Odds</th>
            {isDetailedView && (
              <>
                <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Implied Prob</th>
                <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Model Prob</th>
              </>
            )}
            <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Edge</th>
            {isDetailedView && (
              <>
                <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">EV</th>
                <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">λ Home</th>
                <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">λ Away</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {valueBets.map((row, idx) => (
            <tr key={idx} className="border-b border-[var(--color-border)] hover:bg-[#2A2A2D] transition-colors">
              <td className="p-[var(--spacing-xs)] text-white whitespace-nowrap">
                {row.homeTeam} vs {row.awayTeam}
              </td>
              <td className="p-[var(--spacing-xs)] text-[var(--color-text-secondary)] whitespace-nowrap">
                {formatKickoff(row.kickoffUtc)}
              </td>
              <td className="p-[var(--spacing-xs)]">
                <MarketBadge marketCode={row.market} />
              </td>
              <td className="p-[var(--spacing-xs)] text-white font-medium">
                {formatOdds(row.oddsDecimal)}
              </td>
              {isDetailedView && (
                <>
                  <td className="p-[var(--spacing-xs)] text-white">
                    {formatPercent(row.impliedProbability)}
                  </td>
                  <td className="p-[var(--spacing-xs)] text-white">
                    {formatPercent(row.modelProbability)}
                  </td>
                </>
              )}
              <td className="p-[var(--spacing-xs)]">
                <EdgeBadge edge={row.edge} />
              </td>
              {isDetailedView && (
                <>
                  <td className="p-[var(--spacing-xs)]">
                    <EVBadge ev={row.ev} />
                  </td>
                  <td className="p-[var(--spacing-xs)] text-white">
                    {row.lambdaHome != null ? formatLambda(row.lambdaHome) : '—'}
                  </td>
                  <td className="p-[var(--spacing-xs)] text-white">
                    {row.lambdaAway != null ? formatLambda(row.lambdaAway) : '—'}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
