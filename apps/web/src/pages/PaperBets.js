import React, { useState, useEffect, useCallback } from 'react';
import { fetchPaperBetsList, fetchPaperBetsSummary } from '../lib/api';
import { formatKickoff, formatOdds, formatPercent, formatProfit, formatDate } from '../lib/formatters';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import MarketBadge from '../components/ui/MarketBadge';
import EdgeBadge from '../components/ui/EdgeBadge';
import EVBadge from '../components/ui/EVBadge';
import RefreshButton from '../components/ui/RefreshButton';

/**
 * Paper Bets page — Route: /paper-bets
 * API: GET /paper-bets/list + GET /paper-bets/summary
 * Two tabs: Open bets, Settled bets
 * P&L banner at top
 */
export default function PaperBets() {
  const [activeTab, setActiveTab] = useState('open');
  const [bets, setBets] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [betsRes, summaryRes] = await Promise.all([
        fetchPaperBetsList(activeTab),
        fetchPaperBetsSummary(),
      ]);
      setBets(betsRes);
      setSummary(summaryRes);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={handleRefresh} />;

  const hasSummary = summary && !summary.message;
  const totalProfit = hasSummary ? summary.total_profit : 0;
  const betsList = bets?.bets || [];

  const tabClass = (tab) =>
    `px-4 py-2 text-sm font-medium transition-colors cursor-pointer rounded-t-lg ${
      activeTab === tab
        ? 'bg-[var(--color-card)] text-[var(--color-primary)] border border-[var(--color-border)] border-b-transparent'
        : 'text-[var(--color-text-secondary)] hover:text-white'
    }`;

  return (
    <div className="flex flex-col gap-[var(--spacing-md)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-white font-bold text-xl md:text-2xl">Paper Bets</h1>
        <RefreshButton onRefresh={handleRefresh} isRefreshing={isRefreshing} lastUpdated={lastUpdated} />
      </div>

      {/* P&L Banner */}
      <div className="bg-[var(--color-card)] p-[var(--spacing-sm)] rounded-lg text-center border border-[var(--color-border)]">
        <span className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block">
          Running P&L
        </span>
        <span
          className={`text-2xl md:text-3xl font-bold ${
            totalProfit >= 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
          }`}
        >
          {formatProfit(totalProfit)}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        <button className={tabClass('open')} onClick={() => setActiveTab('open')}>
          Open
        </button>
        <button className={tabClass('settled')} onClick={() => setActiveTab('settled')}>
          Settled
        </button>
      </div>

      {/* Bets list */}
      {betsList.length === 0 ? (
        <EmptyState
          message={
            activeTab === 'open'
              ? 'No open bets at this time.'
              : 'No settled bets yet. Paper bets settle after match day.'
          }
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-[var(--spacing-md)] md:hidden">
            {betsList.map((bet) => (
              <div
                key={bet.id}
                className={`bg-[var(--color-card)] rounded-lg p-[var(--spacing-sm)] shadow-sm border border-[var(--color-border)] flex flex-col gap-[var(--spacing-sm)] ${
                  activeTab === 'settled'
                    ? bet.result === '1'
                      ? 'bg-[var(--color-positive)]/5 border-b-[var(--color-positive)]'
                      : 'bg-[var(--color-negative)]/5 border-b-[var(--color-negative)]'
                    : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium text-sm">
                      {bet.home_team} vs {bet.away_team}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {formatKickoff(bet.kickoff_utc)}
                    </p>
                  </div>
                  {activeTab === 'settled' && bet.profit != null && (
                    <span
                      className={`text-sm font-bold ${
                        bet.profit >= 0
                          ? 'text-[var(--color-positive)]'
                          : 'text-[var(--color-negative)]'
                      }`}
                    >
                      {formatProfit(bet.profit)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <MarketBadge marketCode={bet.market} />
                  <span className="text-white font-bold text-sm">{formatOdds(bet.odds_decimal)}</span>
                  {activeTab === 'open' && <EdgeBadge edge={bet.edge} />}
                  {activeTab === 'open' && <EVBadge ev={bet.ev} />}
                </div>
                <div className="text-xs text-[var(--color-text-secondary)]">
                  {activeTab === 'open'
                    ? `Model: ${formatPercent(bet.model_probability)} · Placed: ${formatDate(bet.placed_at)}`
                    : `Result: ${bet.result === '1' ? 'Win' : 'Loss'} · Settled: ${formatDate(bet.settled_at)}`}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Match</th>
                  <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Market</th>
                  <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Odds</th>
                  {activeTab === 'open' ? (
                    <>
                      <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Model %</th>
                      <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Edge</th>
                      <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">EV</th>
                      <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Placed</th>
                    </>
                  ) : (
                    <>
                      <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Result</th>
                      <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Profit/Loss</th>
                      <th className="text-[var(--color-text-secondary)] font-normal p-[var(--spacing-xs)] whitespace-nowrap">Settled</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {betsList.map((bet) => (
                  <tr
                    key={bet.id}
                    className={`border-b border-[var(--color-border)] transition-colors ${
                      activeTab === 'settled'
                        ? bet.result === '1'
                          ? 'bg-[var(--color-positive)]/5'
                          : 'bg-[var(--color-negative)]/5'
                        : 'hover:bg-[#2A2A2D]'
                    }`}
                  >
                    <td className="p-[var(--spacing-xs)] text-white whitespace-nowrap">
                      {bet.home_team} vs {bet.away_team}
                    </td>
                    <td className="p-[var(--spacing-xs)]">
                      <MarketBadge marketCode={bet.market} />
                    </td>
                    <td className="p-[var(--spacing-xs)] text-white font-medium">
                      {formatOdds(bet.odds_decimal)}
                    </td>
                    {activeTab === 'open' ? (
                      <>
                        <td className="p-[var(--spacing-xs)] text-white">
                          {formatPercent(bet.model_probability)}
                        </td>
                        <td className="p-[var(--spacing-xs)]">
                          <EdgeBadge edge={bet.edge} />
                        </td>
                        <td className="p-[var(--spacing-xs)]">
                          <EVBadge ev={bet.ev} />
                        </td>
                        <td className="p-[var(--spacing-xs)] text-[var(--color-text-secondary)]">
                          {formatDate(bet.placed_at)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-[var(--spacing-xs)]">
                          <span
                            className={`font-medium ${
                              bet.result === '1'
                                ? 'text-[var(--color-positive)]'
                                : 'text-[var(--color-negative)]'
                            }`}
                          >
                            {bet.result === '1' ? 'Win' : 'Loss'}
                          </span>
                        </td>
                        <td className="p-[var(--spacing-xs)]">
                          <span
                            className={`font-bold ${
                              bet.profit >= 0
                                ? 'text-[var(--color-positive)]'
                                : 'text-[var(--color-negative)]'
                            }`}
                          >
                            {formatProfit(bet.profit)}
                          </span>
                        </td>
                        <td className="p-[var(--spacing-xs)] text-[var(--color-text-secondary)]">
                          {formatDate(bet.settled_at)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
