import React from 'react';
import { formatKickoff, formatPercent, formatLambda } from '../../lib/formatters';
import MarketBadge from '../ui/MarketBadge';
import EdgeBadge from '../ui/EdgeBadge';
import EVBadge from '../ui/EVBadge';

/**
 * PredictionsTable — Desktop table view for predictions.
 * Simple columns: Match, Kickoff, Market, Recommendation, Edge
 * Detailed columns: + Lambda Home, Lambda Away, Model Prob, Implied Prob, EV
 */
export default function PredictionsTable({ predictions, isDetailedView }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm md:text-base">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Match</th>
            <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Kickoff</th>
            <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Market</th>
            <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Recommendation</th>
            {isDetailedView && (
              <>
                <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">λ Home</th>
                <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">λ Away</th>
                <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Model Prob</th>
                <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Implied Prob</th>
              </>
            )}
            <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Edge</th>
            {isDetailedView && (
              <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">EV</th>
            )}
          </tr>
        </thead>
        <tbody>
          {predictions.map((row, idx) => (
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
              <td className="p-[var(--spacing-xs)]">
                <span className={`text-xs font-bold px-2 py-1 rounded bg-[var(--color-card)] border ${row.edge > 0 ? 'text-[var(--color-positive)] border-[var(--color-positive)]/20' : 'text-[var(--color-text-secondary)] border-[var(--color-border)]'}`}>
                  {row.edge > 0 ? "VALUE" : "PASS"}
                </span>
              </td>
              {isDetailedView && (
                <>
                  <td className="p-[var(--spacing-xs)] text-white">
                    {formatLambda(row.lambdaHome)}
                  </td>
                  <td className="p-[var(--spacing-xs)] text-white">
                    {formatLambda(row.lambdaAway)}
                  </td>
                  <td className="p-[var(--spacing-xs)] text-white">
                    {formatPercent(row.modelProbability)}
                  </td>
                  <td className="p-[var(--spacing-xs)] text-white">
                    {formatPercent(row.impliedProbability)}
                  </td>
                </>
              )}
              <td className="p-[var(--spacing-xs)]">
                <EdgeBadge edge={row.edge} />
              </td>
              {isDetailedView && (
                <td className="p-[var(--spacing-xs)]">
                  <EVBadge ev={row.ev} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
