import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import { formatMarketName } from '../../lib/formatters';

/**
 * MarketRoiChart — Recharts BarChart.
 * Props: data = [{ market, roi }]
 */
export default function MarketRoiChart({ data }) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((d) => ({
    ...d,
    displayName: formatMarketName(d.market),
    roiPercent: (d.roi * 100),
  }));

  return (
    <div className="bg-[var(--color-card)] rounded-lg p-[var(--spacing-sm)] border border-[var(--color-border)]">
      <h3 className="text-white font-bold text-sm mb-3">Market ROI</h3>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="displayName"
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
              stroke="var(--color-border)"
              angle={-30}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
              stroke="var(--color-border)"
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text)',
                fontSize: '12px',
              }}
              formatter={(value) => [`${Number(value).toFixed(1)}%`, 'ROI']}
            />
            <ReferenceLine y={0} stroke="var(--color-text-secondary)" strokeDasharray="3 3" />
            <Bar dataKey="roiPercent" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.roiPercent >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
