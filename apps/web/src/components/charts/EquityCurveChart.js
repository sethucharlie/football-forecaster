import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

/**
 * EquityCurveChart — Recharts LineChart.
 * Props: data = [{ date, equity }]
 * Line color: green if final equity > 0, red if negative. Baseline at y=0.
 */
export default function EquityCurveChart({ data }) {
  if (!data || data.length === 0) return null;

  const finalEquity = data[data.length - 1].equity;
  const lineColor = finalEquity >= 0 ? 'var(--color-positive)' : 'var(--color-negative)';

  return (
    <div className="bg-[var(--color-card)] rounded-lg p-[var(--spacing-sm)] border border-[var(--color-border)]">
      <h3 className="text-white font-bold text-sm mb-3">Equity Curve</h3>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
              stroke="var(--color-border)"
            />
            <YAxis
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
              stroke="var(--color-border)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text)',
                fontSize: '12px',
              }}
              formatter={(value) => [`R${Number(value).toFixed(2)}`, 'Equity']}
            />
            <ReferenceLine y={0} stroke="var(--color-text-secondary)" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="equity"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: lineColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
