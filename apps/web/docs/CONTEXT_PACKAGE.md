# Football Forecaster — Context Package (Final)

> [!IMPORTANT]
> This is the single source of truth for all agents. Every agent MUST read this document before executing any work. No agent may invent data shapes, components, or behaviors not defined here.

---

## 1. Tech Stack (Updated)

| Layer | Technology |
|---|---|
| Framework | **React (CRA)** + **react-router-dom** |
| Styling | **TailwindCSS** |
| Charts | **Recharts** |
| HTTP Client | **Axios** |
| State | **React Context API** |
| Deployment | **Vercel** |
| Backend | **FastAPI** (Python) |

> [!CAUTION]
> **NOT Next.js.** We are using Create React App with react-router-dom for client-side routing. No file-based routing. No `app/` directory. All pages live in `src/pages/`.

---

## 2. Design System (Strict — No Deviations)

### Color Tokens
| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#84CC16` | Lime-green accent, active nav links, primary buttons |
| `--color-bg` | `#1A1A1D` | Page background |
| `--color-card` | `#232326` | Card/panel background |
| `--color-border` | `#2F2F32` | Dividers, card borders |
| `--color-text` | `#FFFFFF` | Primary text |
| `--color-text-secondary` | `#A1A1AA` | Labels, secondary text |
| `--color-positive` | `#22C55E` | Positive edge, win, profit |
| `--color-negative` | `#EF4444` | Negative edge, loss |
| `--color-neutral` | `#FACC15` | Neutral/warning state |

### Spacing Tokens
| Token | Value | Usage |
|---|---|---|
| `--spacing-xs` | `6px` | Inside table cells |
| `--spacing-sm` | `8px` | Inside cards |
| `--spacing-md` | `12px` | Between components (vertical) |
| `--spacing-lg` | `16px` | Container padding |

### Typography
- **Font:** Inter (Google Fonts)
- Heading: 20–24px | Body: 14–16px | Labels: 12px

### Component Styling Rules
- Cards: `bg-[var(--color-card)]`, `rounded-lg`, `p-[var(--spacing-md)]`, `shadow-sm`
- Dividers: `border-b border-[var(--color-border)]`
- Tables: dark background, subtle row dividers, hover with green tint
- Badges: EdgeBadge (green/red by sign), EVBadge (same), MarketBadge (blue/neutral)

---

## 3. Folder Structure

```
apps/web/src/
  App.js                ← Root: React Router + Layout
  index.js              ← Entry point
  index.css             ← Global styles + CSS tokens

  pages/
    ValueBets.js        ← Route: /
    Performance.js      ← Route: /performance
    Predictions.js      ← Route: /predictions
    PaperBets.js        ← Route: /paper-bets
    HowItWorks.js       ← Route: /how-it-works

  components/
    cards/
      MatchCard.js        ← Mobile value bet card
      ValueBetCard.js
    tables/
      PredictionsTable.js
      ValueBetsTable.js   ← Desktop value bets table
    charts/
      EquityCurveChart.js ← Recharts LineChart
      MarketRoiChart.js   ← Recharts BarChart
      MarketAccuracyChart.js ← Recharts BarChart
    ui/
      LoadingSpinner.js
      ErrorState.js
      EmptyState.js
      ViewToggle.js       ← Simple/Detailed switch
      MarketBadge.js
      EdgeBadge.js
      EVBadge.js
      RefreshButton.js
    layout/
      Layout.js           ← Shared wrapper (Navbar + Footer)
    navigation/
      Navbar.js
      LeagueSelector.js

  context/
    LeagueContext.js

  lib/
    api.js
    formatters.js
    leagues.js
    types.js

  .env
```

---

## 4. API Contracts (6 Endpoints — All Verified)

### Base URL
```
REACT_APP_API_URL=https://football-forecaster.onrender.com
```
- 30-second timeout on all calls (Render free tier sleeps)
- Always pass `league=EPL` (only league for V1)
- Always pass `model_version=poisson_v1` for prediction endpoints

---

### Endpoint 1: `GET /fixtures/upcoming-with-odds`
**Params:** `?league=EPL&min_edge=0` (also: `markets`, `min_ev`)
**Used by:** Home / Value Bets page (`/`)

```json
{
  "count": 4,
  "fixtures": [{
    "match_id": 6045, "league": "EPL",
    "home_team": "Brentford", "away_team": "Everton",
    "kickoff_utc": "2026-04-11T14:00:00", "status": "scheduled",
    "odds": [{
      "market": "OU_25_OVER",
      "odds_decimal": 2.0,
      "implied_probability": 0.5,
      "model_probability": 0.5143,
      "edge": 0.0143,
      "expected_value": 0.0287
    }]
  }]
}
```
**Empty:** `{"count": 0, "fixtures": []}`

---

### Endpoint 2: `GET /predictions/latest`
**Params:** `?league=EPL&model_version=poisson_v1` (also: `markets`, `min_ev`, `min_edge`)
**Used by:** Predictions page (`/predictions`)

```json
{
  "count": 11,
  "fixtures": [{
    "match_id": 6045, "league": "EPL",
    "home_team": "Brentford", "away_team": "Everton",
    "kickoff_utc": "2026-04-11T14:00:00", "status": "scheduled",
    "model_version": "poisson_v1",
    "created_at": "2026-03-31T11:42:09.230457",
    "markets": [{
      "market": "OU_25_OVER",
      "lambda_home": 1.324, "lambda_away": 1.408,
      "odds_implied_probability": 0.5,
      "model_probability": 0.5143,
      "edge": 0.0143, "ev": 0.0287
    }]
  }]
}
```
**Empty:** `{"count": 0, "fixtures": []}`

---

### ⚠️ Field Name Differences (Endpoint 1 vs 2)

| Endpoint 1 | Endpoint 2 | Meaning |
|---|---|---|
| `expected_value` | `ev` | EV per R1 stake |
| `implied_probability` | `odds_implied_probability` | Bookmaker implied prob |
| `odds` (array key) | `markets` (array key) | Per-market data array |

---

### Endpoint 3: `GET /paper-bets/summary`
**Used by:** Performance page, Paper Bets page

```json
{ "total_bets": 10, "total_staked": 10.0, "total_profit": 2.5, "roi": 0.25, "win_rate": 0.6, "avg_edge": 0.045 }
```
**No data:** `{"message": "No settled bets yet"}` — NOT an error, check for `message` field.

---

### Endpoint 4: `GET /paper-bets/equity`
**Used by:** Performance page (Equity Curve chart)

```json
[{"date": "2026-04-12", "equity": 1.5}, {"date": "2026-04-15", "equity": 0.8}]
```
**Empty:** `[]` — hide chart, show "No equity data yet"
**Chart:** x=date, y=equity, baseline at y=0

---

### Endpoint 5: `GET /paper-bets/list` *(NEW)*
**Params:** `?status=open` | `?status=settled` | `?status=all`
**Used by:** Paper Bets page tabs

```json
{
  "count": 2,
  "bets": [{
    "id": 1, "match_id": 6045,
    "home_team": "Brentford", "away_team": "Everton",
    "kickoff_utc": "2026-04-11T14:00:00",
    "market": "OU_25_OVER", "model_version": "poisson_v1",
    "odds_decimal": 2.0, "model_probability": 0.5143,
    "implied_probability": 0.5, "edge": 0.0143, "ev": 0.0287,
    "stake": 1.0, "placed_at": "2026-04-10T09:00:00",
    "result": null, "profit": null, "settled_at": null
  }]
}
```
**Empty:** `{"count": 0, "bets": []}`
**Notes:** `result` = `"1"` (win), `"0"` (loss), or `null` (unsettled)

---

### Endpoint 6: `GET /paper-bets/summary-by-market` *(NEW)*
**Used by:** Performance page (Market ROI + Accuracy bar charts)

```json
{
  "markets": [{
    "market": "BTTS_YES", "total_bets": 5, "wins": 3,
    "win_rate": 0.6, "total_profit": 1.55, "roi": 0.31
  }]
}
```
**No data:** `{"message": "No settled bets yet"}`

---

### Complete Market Code → Display Name Map

| Raw Code | Display Name |
|---|---|
| `OU_15_OVER` | Over 1.5 Goals |
| `OU_15_UNDER` | Under 1.5 Goals |
| `OU_25_OVER` | Over 2.5 Goals |
| `OU_25_UNDER` | Under 2.5 Goals |
| `OU_35_OVER` | Over 3.5 Goals |
| `OU_35_UNDER` | Under 3.5 Goals |
| `BTTS_YES` | Both Teams to Score |
| `BTTS_NO` | Both Teams Not to Score |

---

## 5. Page-Level Logic

### Page 1: Value Bets (`/`) — P0
- **API:** `GET /fixtures/upcoming-with-odds?league=EPL&min_edge=0`
- **Default view:** Simple mode (hide lambda, implied prob, EV)
- **Default filter:** Positive edge only (`min_edge=0`)
- **Default sort:** Edge descending
- **Mobile (<768px):** Card layout | **Desktop (≥768px):** Table layout
- **Simple fields:** Teams, Kickoff, Best market, Odds, Edge badge
- **Detailed fields:** + Model prob, Implied prob, EV, Lambda
- **Features:** View toggle, market filter, refresh button with "Last updated: HH:MM"
- **Empty:** "No value bets found for upcoming fixtures. Data refreshes Monday, Wednesday and Friday."

### Page 2: Model Performance (`/performance`) — P0
- **APIs:** `/paper-bets/summary` + `/paper-bets/equity` + `/paper-bets/summary-by-market`
- **Summary cards (4):** Total Bets, Win Rate (%), ROI (%), Avg Edge (%)
- **Charts:** Equity Curve (LineChart), Market ROI (BarChart), Market Accuracy (BarChart)
- **Equity line color:** Green if final positive, red if negative. Baseline at y=0.
- **Empty:** "No settled bets yet. Paper bets settle after match day."

### Page 3: Paper Bet Tracker (`/paper-bets`) — P1
- **API:** `GET /paper-bets/list?status=open` and `?status=settled`
- **Two tabs:** Open bets, Settled bets
- **P&L banner:** Running total, green (+) or red (-)
- **Open columns:** Match, Market, Odds, Model %, Edge, EV, Placed date
- **Settled columns:** Match, Market, Odds, Result, Profit/Loss, Settled date
- **Win rows:** Green tint | **Loss rows:** Red tint
- **Profit format:** "+R2.50" green, "-R1.00" red

### Page 4: Predictions (`/predictions`) — P1
- **API:** `GET /predictions/latest?league=EPL&model_version=poisson_v1`
- **Simple columns:** Match, Kickoff, Market, Recommendation, Edge
- **Detailed columns:** + Lambda Home, Lambda Away, Model Prob, Implied Prob, EV
- **Filters:** Market type, Min edge, Min EV
- **Shows total count**

### Page 5: How It Works (`/how-it-works`) — P2
- Static page. 5 sections: The Problem, Poisson Model (with formula), Finding Value (visual example), EV (Rands in examples), Data Sources (Understat, The Odds API, football-data.org)
- Use real team names, not placeholders

### Navigation
- 5 page links + League selector (EPL only for V1, hardcoded)
- Active link: `--color-primary` | Logo links to `/`
- Mobile (<768px): hamburger menu
- League persists via Context API

---

## 6. Loading / Error / Empty State Rules

| State | Implementation |
|---|---|
| **Loading** | Centered spinner. Never flash empty UI. |
| **Error** | Card with red border, ⚠️ icon, "Unable to load data. Please try again.", retry button |
| **Empty** | Centered grey text (`--color-text-secondary`) with descriptive message |

---

## 7. Anti-Hallucination Rules

### NEVER
- Use raw market codes in UI
- Hardcode league codes in visible text
- Assume API returns data — always validate
- Use file-based routing (no Next.js)
- Use localStorage
- Show lambda values in Simple mode
- Change color tokens
- Use external UI libraries (Material, Chakra, etc.)
- Use chart libraries other than Recharts

### ALWAYS
- Use `react-router-dom` for navigation
- Use `useLeague()` context for league value
- Handle loading, error, and empty states on every page
- Use `en-ZA` locale for date/number formatting
- Show "Last updated" timestamp after data loads
- Use Recharts with `ResponsiveContainer`
- Follow spacing system exactly
- Format odds to 2 decimal places
- Format percentages with `%` suffix
- Format dates as "Sat, 12 Apr, 16:00"

---

## 8. Agent Dependency Map

### Architect Agent
| Must Read | Output |
|---|---|
| PRD, TechSpec, Context Package | React Router scaffold, `lib/types.js`, `index.css` with tokens, Tailwind config, install deps (react-router-dom, tailwindcss, recharts, axios) |

### Frontend Engineer Agent
| Must Read | Output |
|---|---|
| Context Package §4–§5, `lib/types.js` | All page files in `src/pages/`, `context/LeagueContext.js`, `lib/api.js`, `lib/formatters.js`, `lib/leagues.js`, `App.js` with routes |

### UI/UX Agent
| Must Read | Output |
|---|---|
| Context Package §2, §6, ACCEPTANCE_CRITERIA.md | All components in `src/components/` |

### API Integration Agent
| Must Read | Output |
|---|---|
| Context Package §4, API_RESPONSES.md, backend routes | `lib/api.js` with Axios instance, error classification, response normalizers |

### QA Agent
| Must Read | Output |
|---|---|
| ACCEPTANCE_CRITERIA.md, Context Package §6–§7 | Pass/fail report for all criteria |

---

## 9. League Configuration (V1)

For V1, only **EPL** (English Premier League) is supported. The league selector dropdown should show "Premier League" and be non-interactive or show a single option. Hardcode in `lib/leagues.js`:

```javascript
export const LEAGUES = [
  { code: 'EPL', name: 'Premier League' }
];
export const DEFAULT_LEAGUE = 'EPL';
```

---

## 10. Resolved Warnings

| # | Warning | Resolution |
|---|---|---|
| 1 | Framework mismatch (CRA vs Next.js) | ✅ Staying with CRA + react-router-dom. Docs updated. |
| 2 | Missing paper bets list endpoint | ✅ `GET /paper-bets/list` created in backend. |
| 3 | Missing league list | ✅ EPL only for V1, hardcoded. |
| 4 | Missing per-market performance data | ✅ `GET /paper-bets/summary-by-market` created in backend. |
| 5 | `paper_bets` table not in SQL schema file | ⚠️ Table exists in production but missing from `001_init_schema.sql`. Non-blocking. |
| 6 | Poisson distribution in detailed mode | ✅ Frontend computes from lambda values. No backend change needed. |

> [!NOTE]
> All blockers are resolved. The project is ready for implementation.
