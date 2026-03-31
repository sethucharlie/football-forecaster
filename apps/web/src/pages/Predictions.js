import React, { useState, useEffect, useCallback } from 'react';
import { useLeague } from '../context/LeagueContext';
import { fetchPredictions } from '../lib/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import ViewToggle from '../components/ui/ViewToggle';
import RefreshButton from '../components/ui/RefreshButton';
import PredictionsTable from '../components/tables/PredictionsTable';
import MatchCard from '../components/cards/MatchCard';

/**
 * Predictions page — Route: /predictions
 * API: GET /predictions/latest
 * Simple/Detailed toggle + Filters: Market, Min Edge, Min EV
 */
export default function Predictions() {
  const { league } = useLeague();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDetailedView, setIsDetailedView] = useState(false);
  const [marketFilter, setMarketFilter] = useState('');
  const [minEdge, setMinEdge] = useState('');
  const [minEV, setMinEV] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const params = {};
      if (marketFilter) params.markets = marketFilter;
      if (minEdge) params.min_edge = parseFloat(minEdge);
      if (minEV) params.min_ev = parseFloat(minEV);
      const result = await fetchPredictions(league, params);
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [league, marketFilter, minEdge, minEV]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  // Flatten fixtures → one row per market
  const flattenedPredictions = data?.fixtures?.flatMap((fixture) =>
    (fixture.markets || []).map((m) => ({
      matchId: fixture.match_id,
      homeTeam: fixture.home_team,
      awayTeam: fixture.away_team,
      kickoffUtc: fixture.kickoff_utc,
      market: m.market,
      lambdaHome: m.lambda_home,
      lambdaAway: m.lambda_away,
      modelProbability: m.model_probability,
      impliedProbability: m.odds_implied_probability,
      edge: m.edge,
      ev: m.ev,
    }))
  ) || [];

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={handleRefresh} />;

  return (
    <div className="flex flex-col gap-[var(--spacing-md)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-white font-bold text-xl md:text-2xl">Predictions</h1>
        <div className="flex items-center gap-3">
          <ViewToggle isDetailedView={isDetailedView} onToggle={setIsDetailedView} />
          <RefreshButton onRefresh={handleRefresh} isRefreshing={isRefreshing} lastUpdated={lastUpdated} />
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={marketFilter}
          onChange={(e) => setMarketFilter(e.target.value)}
          className="bg-[var(--color-card)] text-[var(--color-text)] text-sm border border-[var(--color-border)] rounded-lg px-3 py-1.5 outline-none focus:border-[var(--color-primary)] transition-colors"
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
        <input
          type="number"
          step="0.01"
          placeholder="Min Edge"
          value={minEdge}
          onChange={(e) => setMinEdge(e.target.value)}
          className="bg-[var(--color-card)] text-[var(--color-text)] text-sm border border-[var(--color-border)] rounded-lg px-3 py-1.5 w-28 outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-[var(--color-text-secondary)]"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Min EV"
          value={minEV}
          onChange={(e) => setMinEV(e.target.value)}
          className="bg-[var(--color-card)] text-[var(--color-text)] text-sm border border-[var(--color-border)] rounded-lg px-3 py-1.5 w-28 outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-[var(--color-text-secondary)]"
        />
      </div>

      {/* Count */}
      <p className="text-[var(--color-text-secondary)] text-sm">
        Showing {flattenedPredictions.length} matches
      </p>

      {/* Data */}
      {flattenedPredictions.length === 0 ? (
        <EmptyState message="No predictions available for the selected filters." />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-[var(--spacing-md)] md:hidden">
            {data.fixtures.map((fixture, idx) => (
              <MatchCard
                key={idx}
                homeTeam={fixture.home_team}
                awayTeam={fixture.away_team}
                kickoffUtc={fixture.kickoff_utc}
                markets={fixture.markets}
                isDetailedView={isDetailedView}
              />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)]">
            <PredictionsTable predictions={flattenedPredictions} isDetailedView={isDetailedView} />
          </div>
        </>
      )}
    </div>
  );
}
