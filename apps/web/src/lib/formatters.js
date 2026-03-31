/**
 * Market code to human-readable display name map.
 * Context Package §4 — Complete Market Code → Display Name Map.
 */
const MARKET_DISPLAY_NAMES = {
  OU_15_OVER: 'Over 1.5 Goals',
  OU_15_UNDER: 'Under 1.5 Goals',
  OU_25_OVER: 'Over 2.5 Goals',
  OU_25_UNDER: 'Under 2.5 Goals',
  OU_35_OVER: 'Over 3.5 Goals',
  OU_35_UNDER: 'Under 3.5 Goals',
  BTTS_YES: 'Both Teams to Score',
  BTTS_NO: 'Both Teams Not to Score',
};

/**
 * Convert raw market code to display name.
 * @param {string} code
 * @returns {string}
 */
export function formatMarketName(code) {
  return MARKET_DISPLAY_NAMES[code] || code;
}

/**
 * Format a UTC ISO date string to "Sat, 12 Apr, 16:00" (en-ZA locale).
 * @param {string} isoString
 * @returns {string}
 */
export function formatKickoff(isoString) {
  const date = new Date(isoString);
  const day = date.toLocaleDateString('en-ZA', { weekday: 'short' });
  const dayNum = date.getDate();
  const month = date.toLocaleDateString('en-ZA', { month: 'short' });
  const time = date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${day}, ${dayNum} ${month}, ${time}`;
}

/**
 * Format odds to 2 decimal places.
 * @param {number} odds
 * @returns {string}
 */
export function formatOdds(odds) {
  return Number(odds).toFixed(2);
}

/**
 * Format a decimal as a percentage string (e.g. 0.514 → "51.4%").
 * @param {number} value — decimal value (0–1)
 * @returns {string}
 */
export function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Format edge as a percentage (e.g. 0.0143 → "+1.4%").
 * @param {number} edge
 * @returns {string}
 */
export function formatEdge(edge) {
  const pct = (edge * 100).toFixed(1);
  return edge >= 0 ? `+${pct}%` : `${pct}%`;
}

/**
 * Format EV as Rand currency (e.g. 0.0287 → "R0.03").
 * @param {number} ev
 * @returns {string}
 */
export function formatEV(ev) {
  const prefix = ev >= 0 ? '+' : '';
  return `${prefix}R${Math.abs(ev).toFixed(2)}`;
}

/**
 * Format profit as "+R2.50" or "-R1.00".
 * @param {number} profit
 * @returns {string}
 */
export function formatProfit(profit) {
  if (profit >= 0) {
    return `+R${profit.toFixed(2)}`;
  }
  return `-R${Math.abs(profit).toFixed(2)}`;
}

/**
 * Format a date string to short date (e.g. "12 Apr 2026").
 * @param {string} isoString
 * @returns {string}
 */
export function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Format time for "Last updated" display (e.g. "14:30").
 * @param {Date} date
 * @returns {string}
 */
export function formatLastUpdated(date) {
  return date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * Format lambda to 3 decimal places.
 * @param {number} lambda
 * @returns {string}
 */
export function formatLambda(lambda) {
  return Number(lambda).toFixed(3);
}
