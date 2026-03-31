# Football Forecaster — Technical Specification (v3)

## 1. Tech Stack
- Framework: **Next.js 14 App Router**
- Styling: **TailwindCSS**
- Charts: **Recharts**
- HTTP Client: **Axios**
- State: **Context API**
- Deployment: **Vercel**
- Backend: **FastAPI**

---

## 2. Folder Structure

```text
apps/web/
  app/
    layout.js
    page.js
    performance/
      page.js
    predictions/
      page.js
    paper-bets/
      page.js
    how-it-works/
      page.js

  components/
    cards/
      MatchCard.js
      ValueBetCard.js
    tables/
      PredictionsTable.js
      ValueBetsTable.js
    charts/
      EquityCurveChart.js
      MarketRoiChart.js
      MarketAccuracyChart.js
    ui/
      LoadingSpinner.js
      ErrorState.js
      EmptyState.js
      ViewToggle.js
      MarketBadge.js
      EdgeBadge.js
      EVBadge.js
      RefreshButton.js
    navigation/
      Navbar.js
      LeagueSelector.js

  context/
    LeagueContext.js

  lib/
    api.js
    formatters.js
    leagues.js
    types.js (based on JSON schemas)

  public/
    styles/
      tokens.css
  .env.local
```

---

## 3. Environment Variables

```env
NEXT_PUBLIC_API_URL=https://football-forecaster.onrender.com
```

---

## 4. Design Tokens (tokens.css)

```css
:root {
  --color-primary: #84CC16;
  --color-bg: #1A1A1D;
  --color-card: #232326;
  --color-border: #2F2F32;
  --color-text: #FFFFFF;
  --color-text-secondary: #A1A1AA;
  --color-positive: #22C55E;
  --color-negative: #EF4444;
  --color-neutral: #FACC15;
  --spacing-xs: 6px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
}
```

## 5. Component Rules

### Cards
- Use `bg-[var(--color-card)]`
- Rounded: `rounded-lg`
- Spacing: `p-[var(--spacing-md)]`
- Text: `text-[var(--color-text)]`
- Divider: `border-b border-[var(--color-border)]`

### Tables
- Dark background
- Subtle row dividers
- Hover highlight using subtle green tint

### Badges
- MarketBadge: blue/neutral background
- EdgeBadge: green/red background based on value
- EVBadge: same logic as EdgeBadge

## 6. API Client Logic (lib/api.js)

Rules:
- Always pass league via context.
- Always use `axios.create` with 30s timeout.
- Never hardcode baseURL.
- Always catch and classify errors.

## 7. Type Definitions (lib/types.js)

Example:
```javascript
/**
 * @typedef {Object} MarketPrediction
 * @property {string} market
 * @property {number} model_prob
 * @property {number} implied_prob
 * @property {number} odds
 * @property {number} edge
 * @property {number} ev
 */

/**
 * @typedef {Object} FixturePrediction
 * @property {string} match_id
 * @property {string} kickoff
 * @property {string} home_team
 * @property {string} away_team
 * @property {number} lambda_home
 * @property {number} lambda_away
 * @property {MarketPrediction[]} markets
 */
```

## 8. Fetching Pattern (mandatory)

All pages must:
- Show loading spinner until data loaded.
- Show error box if fetch fails.
- Show empty state if no data returned.
- Store last updated time.

## 9. Recharts Rules

Must use:
- ResponsiveContainer
- LineChart, BarChart
- Axis + Tooltip
- Colors derived from design tokens

Never:
- Never use another chart library.
- Never use gradients unless defined.
- Never show overlapping labels on mobile.

## 10. Performance Rules

- All images optimized
- Avoid unnecessary API calls
- Use memoization where needed
- Pages must open under 2.5 seconds on cold Vercel load

## 11. Antigravity Agent Rules

- **Architect Agent**: Owns folder structure, ensures all constraints followed, approves UI consistency
- **Frontend Engineer Agent**: Implements pages + components strictly to PRD
- **UI/UX Agent**: Enforces spacing, color tokens, card/table consistency
- **API Integration Agent**: Ensures responses match JSON schemas
- **QA Agent**: Tests error, loading, empty states, tests mobile + desktop layouts

## 12. Testing Requirements

- UI snapshot testing
- API integration tests (mocked)
- No console errors
- Mobile viewport checks

## 13. Deployment Rules

- Production build must not exceed 1MB JS per page
- No warnings at build time
- Environment variables must exist on Vercel
