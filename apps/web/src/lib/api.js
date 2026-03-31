import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
});

/**
 * GET /fixtures/upcoming-with-odds
 * Used by: Value Bets page
 */
export async function fetchValueBets(league = 'EPL', params = {}) {
  const { data } = await api.get('/fixtures/upcoming-with-odds', {
    params: { league, min_edge: 0, ...params },
  });
  return data;
}

/**
 * GET /predictions/latest
 * Used by: Predictions page
 */
export async function fetchPredictions(league = 'EPL', params = {}) {
  const { data } = await api.get('/predictions/latest', {
    params: { league, model_version: 'poisson_v1', ...params },
  });
  return data;
}

/**
 * GET /paper-bets/summary
 * Used by: Performance page, Paper Bets page
 */
export async function fetchPaperBetsSummary() {
  const { data } = await api.get('/paper-bets/summary');
  return data;
}

/**
 * GET /paper-bets/equity
 * Used by: Performance page (Equity Curve)
 */
export async function fetchEquityCurve() {
  const { data } = await api.get('/paper-bets/equity');
  return data;
}

/**
 * GET /paper-bets/list
 * Used by: Paper Bets page
 */
export async function fetchPaperBetsList(status = 'all') {
  const { data } = await api.get('/paper-bets/list', {
    params: { status },
  });
  return data;
}

/**
 * GET /paper-bets/summary-by-market
 * Used by: Performance page (Market ROI + Accuracy)
 */
export async function fetchSummaryByMarket() {
  const { data } = await api.get('/paper-bets/summary-by-market');
  return data;
}
