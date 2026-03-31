# Football Forecaster — Acceptance Criteria

## How to Use This Document
Each section defines explicit PASS/FAIL criteria for the QA Agent.
Every criterion must pass before the feature is considered complete.

---

## Global Criteria (applies to ALL pages)

| # | Criteria | Pass | Fail |
|---|---|---|---|
| G1 | Loading state | Spinner shown while API call in progress | Page shows blank or crashes |
| G2 | Error state | "Unable to load data. Please try again." shown on API failure | White screen or unhandled error |
| G3 | Empty state | Descriptive message shown when data array is empty | Blank space or broken layout |
| G4 | Market codes | No raw codes like `OU_25_OVER` visible anywhere | Any raw code visible to user |
| G5 | League switching | Switching league in dropdown refreshes ALL page data | Any page shows stale data after switch |
| G6 | Responsive layout | No horizontal scroll on 375px mobile width | Layout breaks or overflows |
| G7 | Last updated | Timestamp shown after data loads | No indication of when data was fetched |
| G8 | Navbar active | Current page link is highlighted | All links same style |
| G9 | API timeout | Shows error after 30 seconds if API doesn't respond | Spinner spins forever |
| G10 | Footer | Footer visible on all pages | Footer missing on any page |

---

## Page 1: Value Bets (`/`)

| # | Criteria | Pass | Fail |
|---|---|---|---|
| V1 | Default filter | Only positive edge bets shown on load | Negative edge bets shown by default |
| V2 | Toggle works | "All bets" toggle shows all predictions | Toggle has no effect |
| V3 | Mobile layout | Cards displayed on screens < 768px | Table shown on mobile |
| V4 | Desktop layout | Table displayed on screens >= 768px | Cards shown on desktop |
| V5 | Edge badge green | Positive edge shown with green badge | Green badge on negative edge |
| V6 | Edge badge red | Negative edge shown with red badge | Red badge on positive edge |
| V7 | Simple view default | Lambda, implied prob, EV hidden on load | Technical fields visible by default |
| V8 | Detailed view | Toggling detailed shows lambda home, lambda away, model prob, implied prob, EV | Any field missing in detailed view |
| V9 | Market filter | Selecting "Over 2.5" shows only OU_25_OVER rows | Filter has no effect |
| V10 | Sorted by edge | Highest edge bets appear first | Random or unsorted order |
| V11 | Refresh button | Clicking refresh calls API again and updates timestamp | Button does nothing |
| V12 | Match display | "Arsenal vs Chelsea" format — home team first | Away team shown first |
| V13 | Date format | "Sat, 12 Apr, 16:00" en-ZA format | ISO string or US format |
| V14 | Odds formatted | "1.85" not "1.850000" | Unformatted decimal |
| V15 | Empty state | "No value bets found for upcoming fixtures. Data refreshes Monday, Wednesday and Friday." | Blank space |

---

## Page 2: Model Performance (`/performance`)

| # | Criteria | Pass | Fail |
|---|---|---|---|
| P1 | Summary cards | 4 cards: Total Bets, Win Rate, ROI, Avg Edge | Any card missing |
| P2 | ROI formatted | Shows "%" suffix | Raw decimal shown |
| P3 | Win rate formatted | Shows "%" suffix | Raw decimal shown |
| P4 | Equity curve renders | Line chart visible with date on x-axis | Chart blank or missing |
| P5 | Equity baseline | Horizontal line at y=0 visible | No baseline shown |
| P6 | Equity color | Green line if final value positive, red if negative | Always same color |
| P7 | Market performance chart | Bar chart with market names on x-axis | Chart blank or missing |
| P8 | Market names formatted | "Over 2.5" not "OU_25_OVER" on chart | Raw codes on chart axis |
| P9 | Prediction accuracy chart | Bar chart showing win rate per market | Chart missing |
| P10 | Charts responsive | Charts resize on mobile without overflow | Chart overflows container |
| P11 | No settled bets | "No settled bets yet. Paper bets settle after match day." | Broken layout or error |
| P12 | Tooltips | Hovering chart shows exact values | No tooltip on hover |

---

## Page 3: Paper Bet Tracker (`/paper-bets`)

| # | Criteria | Pass | Fail |
|---|---|---|---|
| B1 | P&L banner | Running total shown at top in green (positive) or red (negative) | No P&L total shown |
| B2 | Open bets tab | Shows unsettled bets | Shows settled bets in open tab |
| B3 | Settled bets tab | Shows settled bets with result | Shows open bets in settled tab |
| B4 | Win row color | Green row for winning bets | No color coding |
| B5 | Loss row color | Red row for losing bets | No color coding |
| B6 | Open bets columns | Match, Market, Odds, Model %, Edge, EV, Placed date all visible | Any column missing |
| B7 | Settled bets columns | Match, Market, Odds, Result, Profit/Loss, Settled date all visible | Any column missing |
| B8 | Profit formatting | "+R2.50" green, "-R1.00" red | Raw numbers without R prefix |
| B9 | Empty open bets | "No open bets" message | Blank space |
| B10 | Empty settled bets | "No settled bets yet" message | Blank space or error |
| B11 | No data state | Handles `{"message": "No settled bets yet"}` from API | Crashes or shows raw message object |

---

## Page 4: All Predictions (`/predictions`)

| # | Criteria | Pass | Fail |
|---|---|---|---|
| PR1 | Simple view columns | Match, Kickoff, Market, Recommendation, Edge | Any column missing |
| PR2 | Detailed view columns | + Lambda Home, Lambda Away, Model Prob, Implied Prob, EV | Any column missing |
| PR3 | View toggle works | Switching simple/detailed updates visible columns | Toggle has no effect |
| PR4 | Market filter works | Filtering by market shows correct rows | Filter has no effect |
| PR5 | Min edge filter | Setting min edge filters correctly | Filter has no effect |
| PR6 | Edge color coding | Green for positive, red for negative | No color coding |
| PR7 | Empty state | "No predictions found." with helpful message | Blank space |
| PR8 | Count shown | Total number of predictions displayed | No count shown |

---

## Page 5: How It Works (`/how-it-works`)

| # | Criteria | Pass | Fail |
|---|---|---|---|
| H1 | 5 sections present | The Problem, Poisson Model, Finding Value, EV, Data Sources | Any section missing |
| H2 | Formula displayed | `P(X=k) = (e^(-λ) × λ^k) / k!` shown | Formula missing |
| H3 | Worked example | Real team names used in example | Generic placeholder text |
| H4 | Edge example | Visual showing "Our model: 60% vs Bookmaker: 50% = +10% edge" | No visual example |
| H5 | EV example | Rands used in example calculation | Generic currency or no example |
| H6 | Data sources listed | Understat, The Odds API, football-data.org all mentioned | Any source missing |
| H7 | Readable on mobile | No text overflow, readable font size | Text overflows or too small |

---

## Navigation

| # | Criteria | Pass | Fail |
|---|---|---|---|
| N1 | All links work | Every nav link navigates to correct page | Any link 404s or goes wrong page |
| N2 | Active link highlighted | Current page link visually distinct | All links look the same |
| N3 | League dropdown visible | Dropdown shown on all pages | Dropdown missing on any page |
| N4 | League persists | Switching league on one page keeps selection on navigation | League resets on page change |
| N5 | Mobile hamburger | Menu collapses on mobile < 768px | Full navbar shown on mobile |
| N6 | Hamburger opens | Tapping hamburger shows all links | Menu doesn't open |
| N7 | Logo links home | Clicking logo goes to `/` | Logo does nothing |

---

## Performance & Technical

| # | Criteria | Pass | Fail |
|---|---|---|---|
| T1 | No hardcoded URLs | API URL from env var only | Any hardcoded URL in code |
| T2 | No hardcoded league | League from context only | Any hardcoded 'EPL' string in UI |
| T3 | model_version correct | Always `poisson_v1` in API calls | `mock_v1` used anywhere |
| T4 | Vercel deployment | Site accessible at Vercel URL | Deployment fails |
| T5 | No console errors | Browser console clean on all pages | Any uncaught errors in console |
| T6 | Cold start handled | Loading shown for up to 30 seconds | Error shown after 5 seconds |
