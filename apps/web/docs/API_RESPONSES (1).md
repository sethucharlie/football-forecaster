# Football Forecaster — API Response Schemas

## Base URL
`https://football-forecaster.onrender.com`

## Important Notes for Agents
- All API calls must include `league` parameter (default: `EPL`)
- Always pass `model_version=poisson_v1` for predictions endpoints
- Render free tier sleeps — set 30 second timeout on all calls
- `paper-bets/summary` returns `{"message": "No settled bets yet"}` when no data — handle this case
- `paper-bets/equity` returns `[]` when no settled bets — handle this case

---

## 1. GET /fixtures/upcoming-with-odds

**URL:** `/fixtures/upcoming-with-odds?league=EPL&min_edge=0`

**Purpose:** Upcoming fixtures with bookmaker odds, model probabilities, edge and EV. Used on Value Bets page.

**Sample Response:**
```json
{
  "count": 4,
  "fixtures": [
    {
      "match_id": 6045,
      "league": "EPL",
      "home_team": "Brentford",
      "away_team": "Everton",
      "kickoff_utc": "2026-04-11T14:00:00",
      "status": "scheduled",
      "odds": [
        {
          "market": "OU_25_OVER",
          "odds_decimal": 2.0,
          "implied_probability": 0.5,
          "model_probability": 0.5143740736020304,
          "edge": 0.014374073602030357,
          "expected_value": 0.028748147204060714
        },
        {
          "market": "OU_25_UNDER",
          "odds_decimal": 1.75,
          "implied_probability": 0.5714285714285714,
          "model_probability": 0.48562592639796964,
          "edge": -0.08580264503060175,
          "expected_value": -0.15015462880355313
        }
      ]
    }
  ]
}
```

**Key fields:**
| Field | Type | Notes |
|---|---|---|
| `count` | int | Total number of fixtures returned |
| `fixtures` | array | List of fixture objects |
| `match_id` | int | Unique match identifier |
| `home_team` | string | Home team name |
| `away_team` | string | Away team name |
| `kickoff_utc` | string | ISO datetime — format with `en-ZA` locale |
| `odds` | array | List of market objects for this fixture |
| `market` | string | Raw code — ALWAYS format with `formatMarket()` |
| `odds_decimal` | float | Bookmaker decimal odds |
| `implied_probability` | float | `1 / odds_decimal` — multiply by 100 for % |
| `model_probability` | float | Poisson model probability — multiply by 100 for % |
| `edge` | float | `model_probability - implied_probability` — positive = value bet |
| `expected_value` | float | EV per R1 staked — positive = profitable |

**Empty state:** `{"count": 0, "fixtures": []}`

---

## 2. GET /predictions/latest

**URL:** `/predictions/latest?league=EPL&model_version=poisson_v1`

**Purpose:** Latest predictions with lambda values. Used on Predictions page and detailed view.

**Sample Response:**
```json
{
  "count": 11,
  "fixtures": [
    {
      "match_id": 6045,
      "league": "EPL",
      "home_team": "Brentford",
      "away_team": "Everton",
      "kickoff_utc": "2026-04-11T14:00:00",
      "status": "scheduled",
      "model_version": "poisson_v1",
      "created_at": "2026-03-31T11:42:09.230457",
      "markets": [
        {
          "market": "OU_25_OVER",
          "lambda_home": 1.3240440324449594,
          "lambda_away": 1.4087485515643106,
          "odds_implied_probability": 0.5,
          "model_probability": 0.5143740736020304,
          "edge": 0.014374073602030357,
          "ev": 0.028748147204060714
        },
        {
          "market": "OU_25_UNDER",
          "lambda_home": 1.3240440324449594,
          "lambda_away": 1.4087485515643106,
          "odds_implied_probability": 0.5714285714285714,
          "model_probability": 0.48562592639796964,
          "edge": -0.08580264503060175,
          "ev": -0.15015462880355313
        }
      ]
    }
  ]
}
```

**Key fields (additional to endpoint 1):**
| Field | Type | Notes |
|---|---|---|
| `model_version` | string | Always `poisson_v1` |
| `created_at` | string | When prediction was generated |
| `markets` | array | Per-market prediction data (note: `odds` in endpoint 1, `markets` here) |
| `lambda_home` | float | Expected home goals — show in detailed view only |
| `lambda_away` | float | Expected away goals — show in detailed view only |
| `odds_implied_probability` | float | Note: field name differs from endpoint 1 (`implied_probability` vs `odds_implied_probability`) |
| `ev` | float | Note: field name differs from endpoint 1 (`expected_value` vs `ev`) |

**Empty state:** `{"count": 0, "fixtures": []}`

---

## 3. GET /paper-bets/summary

**URL:** `/paper-bets/summary`

**Purpose:** Aggregate paper bet statistics. Used on Performance and Paper Bets pages.

**Sample Response (when bets exist):**
```json
{
  "total_bets": 10,
  "total_staked": 10.0,
  "total_profit": 2.5,
  "roi": 0.25,
  "win_rate": 0.6,
  "avg_edge": 0.045
}
```

**CRITICAL — Empty state response:**
```json
{"message": "No settled bets yet"}
```
This is NOT an error — handle it gracefully. Show empty state message, not an error.

**Key fields:**
| Field | Type | Notes |
|---|---|---|
| `total_bets` | int | Total settled bets |
| `total_staked` | float | Total amount staked in R |
| `total_profit` | float | Net profit/loss in R |
| `roi` | float | Return on investment — multiply by 100 for % |
| `win_rate` | float | Proportion of winning bets — multiply by 100 for % |
| `avg_edge` | float | Average edge across all bets — multiply by 100 for % |

---

## 4. GET /paper-bets/equity

**URL:** `/paper-bets/equity`

**Purpose:** Daily profit data for equity curve chart. Used on Performance page.

**Sample Response (when data exists):**
```json
[
  { "date": "2026-04-12", "equity": 1.5 },
  { "date": "2026-04-15", "equity": 0.8 },
  { "date": "2026-04-19", "equity": 3.2 }
]
```

**Empty state:** `[]` — show "No equity data yet" message, do not render chart.

**Key fields:**
| Field | Type | Notes |
|---|---|---|
| `date` | string | Date string — format with `en-ZA` locale |
| `equity` | float | Cumulative profit up to this date |

**Chart usage:** x-axis = `date`, y-axis = `equity`, add horizontal baseline at y=0.

---

## Field Name Inconsistencies to Watch
These field names differ between endpoints — agents must handle both:

| Endpoint 1 | Endpoint 2 | Meaning |
|---|---|---|
| `expected_value` | `ev` | Expected value per R1 stake |
| `implied_probability` | `odds_implied_probability` | Bookmaker implied probability |
| `odds` (array key) | `markets` (array key) | Per-market data array |

---

## Error States to Handle
| Scenario | API Response | UI Response |
|---|---|---|
| No fixtures with odds | `{"count": 0, "fixtures": []}` | "No value bets found" empty state |
| No predictions generated | `{"count": 0, "fixtures": []}` | "No predictions found" empty state |
| No settled bets | `{"message": "No settled bets yet"}` | "No settled bets yet" empty state |
| No equity data | `[]` | "No equity data yet" — hide chart |
| API down/timeout | Network error | "Unable to load data. Please try again." |

---

## 5. GET /paper-bets/list

**URL:** `/paper-bets/list?status=open` or `?status=settled` or `?status=all`

**Purpose:** Individual paper bets with team names. Used on Paper Bets page tabs.

**Sample Response:**
```json
{
  "count": 3,
  "bets": [
    {
      "id": 1,
      "match_id": 6045,
      "home_team": "Brentford",
      "away_team": "Everton",
      "kickoff_utc": "2026-04-11T14:00:00",
      "market": "OU_25_OVER",
      "model_version": "poisson_v1",
      "odds_decimal": 2.0,
      "model_probability": 0.5143,
      "implied_probability": 0.5,
      "edge": 0.0143,
      "ev": 0.0287,
      "stake": 1.0,
      "placed_at": "2026-04-10T09:00:00",
      "result": null,
      "profit": null,
      "settled_at": null
    },
    {
      "id": 2,
      "match_id": 6040,
      "home_team": "Arsenal",
      "away_team": "Chelsea",
      "kickoff_utc": "2026-04-05T15:00:00",
      "market": "BTTS_YES",
      "model_version": "poisson_v1",
      "odds_decimal": 1.85,
      "model_probability": 0.62,
      "implied_probability": 0.54,
      "edge": 0.08,
      "ev": 0.147,
      "stake": 1.0,
      "placed_at": "2026-04-04T09:00:00",
      "result": "1",
      "profit": 0.85,
      "settled_at": "2026-04-05T17:00:00"
    }
  ]
}
```

**Key fields:**
| Field | Type | Notes |
|---|---|---|
| `status` query param | string | `open`, `settled`, or `all` — filters by settled_at |
| `result` | string or null | `"1"` = win, `"0"` = loss, `null` = unsettled |
| `profit` | float or null | Positive = win, negative = loss, null = unsettled |
| `settled_at` | string or null | ISO datetime, null for open bets |
| `placed_at` | string | ISO datetime when bet was placed |

**Empty state:** `{"count": 0, "bets": []}`

---

## 6. GET /paper-bets/summary-by-market

**URL:** `/paper-bets/summary-by-market`

**Purpose:** Per-market performance breakdown. Used for Performance page bar charts.

**Sample Response (when data exists):**
```json
{
  "markets": [
    {
      "market": "BTTS_YES",
      "total_bets": 5,
      "wins": 3,
      "win_rate": 0.6,
      "total_profit": 1.55,
      "roi": 0.31
    },
    {
      "market": "OU_25_OVER",
      "total_bets": 8,
      "wins": 5,
      "win_rate": 0.625,
      "total_profit": 2.10,
      "roi": 0.2625
    }
  ]
}
```

**Empty state:**
```json
{"message": "No settled bets yet"}
```
Handle same as `/paper-bets/summary` — check for `message` field.

**Key fields:**
| Field | Type | Notes |
|---|---|---|
| `market` | string | Raw code — format with `formatMarket()` |
| `total_bets` | int | Settled bets for this market |
| `wins` | int | Winning bets |
| `win_rate` | float | `wins / total_bets` — multiply by 100 for % |
| `total_profit` | float | Net profit for this market |
| `roi` | float | `total_profit / total_staked` — multiply by 100 for % |

**Chart usage:**
- **Market ROI chart:** x-axis = formatted market name, y-axis = ROI %
- **Market Accuracy chart:** x-axis = formatted market name, y-axis = win_rate %

---

## Updated Error States to Handle
| Scenario | API Response | UI Response |
|---|---|---|
| No fixtures with odds | `{"count": 0, "fixtures": []}` | "No value bets found" empty state |
| No predictions generated | `{"count": 0, "fixtures": []}` | "No predictions found" empty state |
| No settled bets (summary) | `{"message": "No settled bets yet"}` | "No settled bets yet" empty state |
| No settled bets (by market) | `{"message": "No settled bets yet"}` | Hide market charts, show empty state |
| No equity data | `[]` | "No equity data yet" — hide chart |
| No paper bets (list) | `{"count": 0, "bets": []}` | "No open/settled bets" empty state |
| API down/timeout | Network error | "Unable to load data. Please try again." |
