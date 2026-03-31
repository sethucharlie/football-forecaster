import React, { useState, useEffect, useCallback } from 'react';
import { useLeague } from '../context/LeagueContext';
import { fetchValueBets } from '../lib/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import ViewToggle from '../components/ui/ViewToggle';
import RefreshButton from '../components/ui/RefreshButton';
import ValueBetsTable from '../components/tables/ValueBetsTable';
import ValueBetCard from '../components/cards/ValueBetCard';

/**
 * Value Bets page — Route: /
 * API: GET /fixtures/upcoming-with-odds
 * Mobile: Card layout | Desktop: Table layout
 * Simple/Detailed toggle
 */
export default function ValueBets() {
  const { league } = useLeague();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDetailedView, setIsDetailedView] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showAllBets, setShowAllBets] = useState(false);
  const [marketFilter, setMarketFilter] = useState('');

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const params = {};
      if (showAllBets) params.min_edge = ''; // Removes min_edge constraint
      if (marketFilter) params.markets = marketFilter;
      const result = await fetchValueBets(league, params);
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [league, showAllBets, marketFilter]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  // Flatten fixtures into rows: one row per fixture per odds entry
  const flattenedBets = data?.fixtures?.flatMap((fixture) =>
    (fixture.odds || []).map((odd) => ({
      matchId: fixture.match_id,
      homeTeam: fixture.home_team,
      awayTeam: fixture.away_team,
      kickoffUtc: fixture.kickoff_utc,
      market: odd.market,
      oddsDecimal: odd.odds_decimal,
      modelProbability: odd.model_probability,
      impliedProbability: odd.implied_probability,
      edge: odd.edge,
      ev: odd.expected_value,
      lambdaHome: null, // Endpoint 1 does not return lambda
      lambdaAway: null,
    }))
  ) || [];

  // Default sort: Edge descending
  flattenedBets.sort((a, b) => b.edge - a.edge);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={handleRefresh} />;

  return (
    <div className="flex flex-col gap-[var(--spacing-md)]">
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-white font-bold text-xl md:text-2xl">Value Bets</h1>
        <div className="flex flex-wrap items-center gap-3">
          {/* Market Filter */}
          <select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            className="bg-[var(--color-card)] text-[var(--color-text)] text-sm border border-[var(--color-border)] rounded-lg px-3 py-1.5 outline-none focus:border-[var(--color-primary)] transition-colors cursor-pointer max-w-[150px] md:max-w-xs"
          >
            <option value="">All Markets</option>
            <option value="OU_15_OVER">Over 1.5 Goals</option>
            <option value="OU_15_UNDER">Under 1.5 Goals</option>
            <option value="OU_25_OVER">Over 2.5 Goals</option>
            <option value="OU_25_UNDER">Under 2.5 Goals</option>
            <option value="OU_35_OVER">Over 3.5 Goals</option>
            <option value="OU_35_UNDER">Under 3.5 Goals</option>
            <option value="BTTS_YES">Both Teams to Score</option>
            <option value="BTTS_NO">Both Teams Not to Score</option>
          </select>
          
          {/* All Bets Toggle */}
          <label className="flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-1.5">
            <input
              type="checkbox"
              checked={showAllBets}
              onChange={(e) => setShowAllBets(e.target.checked)}
              className="accent-[var(--color-primary)]"
            />
            All Bets
          </label>
          <ViewToggle isDetailedView={isDetailedView} onToggle={setIsDetailedView} />
          <RefreshButton onRefresh={handleRefresh} isRefreshing={isRefreshing} lastUpdated={lastUpdated} />
        </div>
      </div>

      {/* Data feed */}
      {flattenedBets.length === 0 ? (
        <EmptyState message="No value bets found for upcoming fixtures. Data refreshes Monday, Wednesday and Friday." />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-[var(--spacing-md)] md:hidden">
            {flattenedBets.map((bet, idx) => (
              <ValueBetCard key={idx} {...bet} isDetailedView={isDetailedView} />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)]">
            <ValueBetsTable valueBets={flattenedBets} isDetailedView={isDetailedView} />
          </div>
        </>
      )}
    </div>
  );
}
