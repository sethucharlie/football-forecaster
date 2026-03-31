import React, { useState, useEffect, useCallback } from 'react';
import { fetchPaperBetsSummary, fetchEquityCurve, fetchSummaryByMarket } from '../lib/api';
import { formatPercent } from '../lib/formatters';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import RefreshButton from '../components/ui/RefreshButton';
import EquityCurveChart from '../components/charts/EquityCurveChart';
import MarketRoiChart from '../components/charts/MarketRoiChart';
import MarketAccuracyChart from '../components/charts/MarketAccuracyChart';

/**
 * Performance page — Route: /performance
 * APIs: /paper-bets/summary + /paper-bets/equity + /paper-bets/summary-by-market
 * Summary cards (4) + Equity Curve + Market ROI + Market Accuracy
 */
export default function Performance() {
  const [summary, setSummary] = useState(null);
  const [equity, setEquity] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [summaryRes, equityRes, marketRes] = await Promise.all([
        fetchPaperBetsSummary(),
        fetchEquityCurve(),
        fetchSummaryByMarket(),
      ]);
      setSummary(summaryRes);
      setEquity(equityRes);
      setMarketData(marketRes);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={loadData} />;

  // Check for "No settled bets yet" message response
  const hasSummary = summary && !summary.message;
  const hasMarketData = marketData && !marketData.message && marketData.markets?.length > 0;
  const hasEquity = Array.isArray(equity) && equity.length > 0;

  if (!hasSummary && !hasEquity && !hasMarketData) {
    return (
      <div className="flex flex-col gap-[var(--spacing-md)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-white font-bold text-xl md:text-2xl">Model Performance</h1>
          <RefreshButton onRefresh={handleRefresh} isRefreshing={isRefreshing} lastUpdated={lastUpdated} />
        </div>
        <EmptyState message="No settled bets yet. Paper bets settle after match day." />
      </div>
    );
  }

  const stats = [
    { label: 'Total Bets', value: hasSummary ? summary.total_bets : '—' },
    { label: 'Win Rate', value: hasSummary ? formatPercent(summary.win_rate) : '—' },
    { label: 'ROI', value: hasSummary ? formatPercent(summary.roi) : '—' },
    { label: 'Avg Edge', value: hasSummary ? formatPercent(summary.avg_edge) : '—' },
  ];

  return (
    <div className="flex flex-col gap-[var(--spacing-md)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-white font-bold text-xl md:text-2xl">Model Performance</h1>
        <RefreshButton onRefresh={handleRefresh} isRefreshing={isRefreshing} lastUpdated={lastUpdated} />
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--spacing-md)]">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--color-card)] rounded-lg p-[var(--spacing-sm)] flex flex-col justify-center items-center shadow-sm border border-[var(--color-border)]"
          >
            <span className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
              {stat.label}
            </span>
            <span className="text-2xl md:text-3xl font-bold text-white mt-1">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Equity Curve */}
      {hasEquity ? (
        <EquityCurveChart data={equity} />
      ) : (
        <EmptyState message="No equity data yet" />
      )}

      {/* Market charts */}
      {hasMarketData && (
        <div className="flex flex-col md:grid md:grid-cols-2 gap-[var(--spacing-md)]">
          <MarketRoiChart data={marketData.markets} />
          <MarketAccuracyChart data={marketData.markets} />
        </div>
      )}
    </div>
  );
}
