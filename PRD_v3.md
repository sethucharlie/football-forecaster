# Football Forecaster — Product Requirements Document (PRD v3)

## 1. Overview
Football Forecaster is a semi-private, analytics-driven web application that provides:
- High-quality football match predictions,
- Value betting suggestions,
- Transparent model performance tracking,
- A clean & modern dark-mode UI.

The tool is primarily for:
- The developer (self-use),
- A small circle of friends who bet casually,
- Recruiters evaluating full-stack and data skills.

The app is **publicly accessible**, but not positioned as a commercial product yet.

---

## 2. Product Goals

### Primary Goals
1. Provide clean, accurate, readable prediction data.
2. Deliver value bet suggestions quickly (home screen).
3. Show transparent model performance (ROI, accuracy, equity curve).
4. Demonstrate high-quality engineering & design to recruiters.
5. Support both **simple** and **detailed** views for different user types.

### Secondary Goals
- Maintain consistent UI and data formatting.
- Provide clear model explanations ("How It Works").

### Non-Goals (V1)
- User authentication
- Real-money betting
- Personalization
- Notifications
- Payment systems
- Social or sharing features

---

## 3. Target Users

### 1. Developer / Owner
Needs:
- Full detailed analysis of model output.
- Inspect lambda, EV, detailed Poisson calculations.
- Historical performance insights.

### 2. Friends (Casual Bettors)
Needs:
- Quick, simple recommendations.
- Best value bets only.
- Easy mobile UI.

### 3. Recruiters
Needs:
- Clear architecture,
- Clean UI,
- Transparency of modelling.

---

## 4. High-Level Design Direction

Inspired by:
- **BetMines** → Dark dashboard aesthetic, crisp badges, stat-heavy cards.
- **FreeSuperTips** → Good spacing, clean readable layout, larger card elements.

### UX Principles
- Dark mode only.
- Mobile-first but fully responsive.
- Clean spacing — no clutter.
- Bold numbers, simple text.
- Strong use of color to signal value/edge.
- Simple = minimalist, casual-friendly.
- Detailed = full analytics for power users.

---

## 5. Design System

### Color Tokens

Primary Accent: #84CC16 (lime green)
Background Primary: #1A1A1D
Background Card: #232326
Border: #2F2F32
Text Primary: #FFFFFF
Text Secondary: #A1A1AA
Positive: #22C55E
Negative: #EF4444
Neutral: #FACC15


### Typography
- **Font:** Inter
- **Sizes:**  
  - Heading: 20–24px  
  - Body: 14–16px  
  - Labels: 12px  

### Spacing Rules (critical)
- 16px container padding
- 12px vertical spacing between components
- 8px inside cards
- 6px inside table cells

### UI Components Pattern
- Rounded corners: `rounded-lg`
- Cards: `shadow-sm`, subtle, not heavy
- Dividers: thin, low-contrast (`border-[#2F2F32]`)
- Tables: zebra or subtle row separation

---

## 6. Application Structure (Pages)

### 1. **Home — Value Bets (`/`)** (P0)
Primary purpose:
- Show immediate, actionable bets.
- Default to **Simple mode** for friends.

Layout:
- **Mobile:** Cards, one match per card, top recommendation only.
- **Desktop:** Table layout.

Features:
- Toggle Simple / Detailed view
- Filter: value bets only (edge > 0)
- Market filter
- Refresh button with “Last updated: HH:MM”
- Sorting by Edge (default desc)

Simple Mode Fields:
- Teams
- Kickoff
- Best market recommendation
- Odds
- Edge badge

Detailed Mode Fields:
- Model probability
- Implied probability
- EV
- Lambda values
- Poisson goal distribution (table)
- Market badges
- Charts (if available)

---

### 2. **Predictions (`/predictions`)** (P1)
Main table of all predictions.

Simple Mode:
- Match
- Kickoff
- Market recommendation
- Edge

Detailed Mode:
- Lambda home
- Lambda away
- Model probability
- Implied probability
- EV
- Market code → formatted name
- Full Poisson distribution

Filters:
- Market type
- Minimum edge
- Minimum EV

---

### 3. **Model Performance (`/performance`)** (P0)
Purpose: prove transparency and model validity.

Components:
1. Summary cards  
   - Total Bets  
   - Win Rate  
   - ROI  
   - Avg Edge  
2. **Charts:**  
   - Equity curve (Recharts LineChart)  
   - ROI per market (bar chart)  
   - Accuracy per market (bar chart)

---

### 4. **Paper Bets (`/paper-bets`)** (P1)
Two-tab layout:
- Open bets
- Settled bets

Fields:
- Match
- Market
- Odds
- EV
- Edge
- Placed date
- Settled result (win/loss)
- Profit/loss

---

### 5. **How It Works (`/how-it-works`)** (P2)
Clear sections:
1. The problem  
2. Poisson model overview  
3. Value concept  
4. Expected value formula  
5. Data sources  

---

## 7. Data Contracts (JSON Schemas)

### Fixtures With Odds
```json
{
  "type": "object",
  "properties": {
    "match_id": { "type": "string" },
    "kickoff": { "type": "string" },
    "home_team": { "type": "string" },
    "away_team": { "type": "string" },
    "markets": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "market": { "type": "string" },
          "model_prob": { "type": "number" },
          "implied_prob": { "type": "number" },
          "odds": { "type": "number" },
          "edge": { "type": "number" },
          "ev": { "type": "number" }
        }
      }
    }
  }
}
```

### Predictions
```json
{
  "match_id": "123",
  "kickoff": "2026-03-01T15:00:00Z",
  "home_team": "Arsenal",
  "away_team": "Chelsea",
  "lambda_home": 1.42,
  "lambda_away": 0.95,
  "markets": [{ }],
  "poisson_distribution": {
    "home": [0.23, 0.32, 0.21],
    "away": [0.31, 0.29, 0.25]
  }
}
```

### Paper Bets Summary
```json
{
  "total_bets": 124,
  "win_rate": 0.53,
  "roi": 0.082,
  "avg_edge": 0.041
}
```

### Equity Curve
```json
{
  "dates": ["2026-01-01", "2026-01-02"],
  "profit": [0, 2.5]
}
```

## 8. Loading / Error / Empty State Rules

### Loading
Always show centered spinner.
Never flash empty UI.
Use suspense transitions to reduce jumpiness.

### Error
Show card:
- Red border
- Icon (⚠️)
- Message: “Unable to load data. Please try again.”
- Include retry button → triggers fetch.

### Empty
Examples:
- “No value bets found.”
- “No settled bets yet.”
Must be centered, with grey text.

## 9. Anti-Hallucination Rules (Critical)

### NEVER:
Never use raw market codes (OU_25_OVER) in UI.
Never hardcode league code anywhere in text.
Never assume API returns data.
Never use Pages Router.
Never use localStorage.
Never show lambda values in Simple mode.
Never change color tokens.

### ALWAYS:
Always use useLeague() for league.
Always handle empty/error states.
Always use en-ZA formatting.
Always show “Last updated”.
Always use Recharts for charts.
Always follow spacing system.

## 10. Roadmap

### MVP
Value Bets
Predictions
Performance

### V1
Paper Bets + full tracking
Advanced detailed view improvements
Better charts

### V2
User accounts
Bankroll simulator
Custom notifications
Multi-model support

## 11. Success Metrics
Must load under 2.5 seconds on cold open.
Zero console errors.
Zero unstyled elements.
UI looks clean on 360px screens.
Recruiters understand architecture in 2 minutes.
