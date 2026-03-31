# Football Forecaster — UI/UX Blueprints

> [!IMPORTANT]
> This document defines the precise UI blueprints for Football Forecaster based on the PRD and Context Package. 
> Strict adherence to the dark theme, lime accent, and component specifications is required. No completely new UI elements.

## 1. Global Component Styling Rules

### Design Tokens & Base Styles
- **Dark Theme Rules**: The application is strictly dark mode. No light mode toggles.
  - Background: `bg-[var(--color-bg)]` (`#1A1A1D`)
  - Surface/Cards: `bg-[var(--color-card)]` (`#232326`)
  - Borders/Dividers: `border-[var(--color-border)]` (`#2F2F32`)
- **Typography**: Inter font family applied globally.
  - Headings: `text-white font-bold text-xl md:text-2xl`
  - Body: `text-white text-sm md:text-base`
  - Labels/Secondary: `text-[var(--color-text-secondary)] text-xs md:text-sm`
  - Positive values: `text-[var(--color-positive)]` (`#22C55E`)
  - Negative values: `text-[var(--color-negative)]` (`#EF4444`)
  - Neutral/Warning: `text-[var(--color-neutral)]` (`#FACC15`)
  - Lime Accent/Active states: `text-[var(--color-primary)]` (`#84CC16`)
- **Spacing System** (Using CSS variable references):
  - Screen Padding: `p-[var(--spacing-lg)]` (16px)
  - Section/Component Gaps: `gap-[var(--spacing-md)]` (12px)
  - Card Inner Padding: `p-[var(--spacing-sm)]` (8px)
  - Table Cell Padding: `p-[var(--spacing-xs)]` (6px)

### Layout & Transitions
- **Mobile → Desktop Transitions**: 
  - `< 768px` (Mobile): Default to stacked Card layouts (`flex flex-col gap-[var(--spacing-md)]`). Hamburger menu for navigation.
  - `≥ 768px` (Desktop): Transitions to Table layouts. Horizontal Navbar navigation.
- **Table Layout Rules**:
  - Background: `bg-[var(--color-card)]`
  - Row dividers: `border-b border-[var(--color-border)]`
  - Hover effect: Subtle background tint on rows showing a positive edge (lime tint), or pure neutral highlight (`hover:bg-[#2A2A2D]`).
- **Chart Container Rules**:
  - Constrained inside a card wrapper: `bg-[var(--color-card)] rounded-lg p-[var(--spacing-sm)] border border-[var(--color-border)]`.
  - Must use `<ResponsiveContainer width="100%" height="100%">` from Recharts.
  - Fixed mobile heights (`h-64`), taller desktop heights (`md:h-80`) to prevent layout shift.

## 2. Global State Rules

Behavior for data fetching boundaries:

- **Loading State**:
  - Never flash empty UI.
  - Display a centered `<LoadingSpinner />` (lime green `border-t-[var(--color-primary)]` rotating circle) within the main content area.
- **Empty State**:
  - Centered text using secondary text color: `text-[var(--color-text-secondary)] text-center my-8 md:my-16`.
  - Content must clearly explain why it's empty (e.g., "No value bets found for upcoming fixtures. Data refreshes Monday, Wednesday and Friday.").
- **Error State**:
  - Card format: `border border-[var(--color-negative)] rounded-lg p-[var(--spacing-sm)] bg-[var(--color-card)]`.
  - Icon: ⚠️ (Warning icon, text-yellow or text-red).
  - Message: "Unable to load data. Please try again."
  - Action: Include a recognizable retry button (`border border-white text-white hover:bg-white/10 rounded px-4 py-2`).
- **View Toggle Behavior (Simple vs Detailed)**:
  - Toggle UI: A segmented control pill or dual buttons at the top right of data views.
  - Active state: `bg-[var(--color-primary)] text-[#1A1A1D] font-medium`.
  - Inactive state: `bg-transparent text-[var(--color-text-secondary)] hover:text-white`.
  - Interaction: Clicking instantly reveals/hides columns (in tables) or expands/collapses data blocks (in cards).

## 3. Visual Specs for Reusable UI Elements

- **Cards**: `bg-[var(--color-card)] rounded-lg p-[var(--spacing-sm)] shadow-sm border border-[var(--color-border)] flex flex-col gap-[var(--spacing-sm)]`.
- **Tables**: `w-full text-left text-sm md:text-base`. Headers: `text-[var(--color-text-secondary)] font-normal border-b border-[var(--color-border)] p-[var(--spacing-xs)] whitespace-nowrap`. Body cells: `p-[var(--spacing-xs)]`.
- **Badges**:
  - **EdgeBadge**: Pill shape `rounded-full px-2 py-1 text-xs font-bold whitespace-nowrap`. If edge > 0: `bg-[var(--color-positive)]/10 text-[var(--color-positive)]`. If < 0: `bg-[var(--color-negative)]/10 text-[var(--color-negative)]`.
  - **EVBadge**: Identical styling to EdgeBadge, representing expected value formatted with currency.
  - **MarketBadge**: Subtle pill `bg-[#2A2A2D] text-[var(--color-text)] rounded px-2 py-1 text-xs border border-[var(--color-border)]`. Displays human-readable name, never raw code.
- **Navbar**: `bg-[var(--color-bg)] border-b border-[var(--color-border)] h-16 flex items-center justify-between px-[var(--spacing-lg)]`. Logo on left. Active link text `text-[var(--color-primary)]`, inactive `text-[var(--color-text-secondary)]`.
- **Refresh Button**: Icon button (circular arrow). Paired text: "Last updated: HH:MM" in `text-[var(--color-text-secondary)] text-xs`.
- **Summary Stat Cards**: `bg-[var(--color-card)] rounded-lg p-[var(--spacing-sm)] flex flex-col justify-center items-center shadow-sm border border-[var(--color-border)]`. Top label `text-[var(--color-text-secondary)] text-xs uppercase tracking-wider`, bottom value `text-2xl md:text-3xl font-bold text-white`.
- **Equity Chart Section**: See "Page 2" rules for specific chart container rules. Baseline y=0 line clearly visible (white/grey). Line stroke green if final > start, red if final < start.

## 4. Page-by-Page Precise UI Blueprints

### Page 1: Value Bets (`/`) - Mobile First, Desktop Table
- **Layout**: Top action bar with Page Title ("Value Bets"), View Toggle (Simple/Detailed), League Selector (EPL), and Refresh Button. Below is the main data feed.
- **Mobile (< 768px)**:
  - Renders a list of `ValueBetCard` components separated by `gap-[var(--spacing-md)]`.
  - **Simple Mode**:
    - Card Header: Teams (e.g., "Brentford vs Everton") | Kickoff time (`text-xs text-[var(--color-text-secondary)]`).
    - Card Body: Best market recommendation (MarketBadge), Odds (bold white text).
    - Card Right/Footer: EdgeBadge.
  - **Detailed Mode**: Expands the card vertically to add: Model Probability, Implied Probability, EVBadge, Lambda values.
- **Desktop (≥ 768px)**:
  - Renders `ValueBetsTable`.
  - **Simple Mode Columns**: Teams, Kickoff, Market, Odds, Edge.
  - **Detailed Mode Columns**: Teams, Kickoff, Market, Odds, Implied Prob, Model Prob, Edge, EV, Lambda (Home/Away).

### Page 2: Model Performance (`/performance`)
- **Layout**: Dashboard grid format.
- **Hierarchy Structure**: 
  - Title: "Model Performance".
  - Top row: 4 Summary Stat Cards (Total Bets, Win Rate %, ROI %, Avg Edge %). Mobile: `grid-cols-2`, Desktop: `grid-cols-4`. Gap: `var(--spacing-md)`.
  - Middle row: Equity Curve Chart card. Spans 100% width.
  - Bottom row: Market ROI and Market Accuracy bar charts. Stacked on mobile (`flex-col`), side-by-side on desktop (`grid-cols-2`).
- **State**: No Simple/Detailed toggle.

### Page 3: Predictions (`/predictions`)
- **Layout**: Full-page layout prioritizing data density.
- **Hierarchy Structure**: Page Title -> Filter Bar (`Market Type`, `Min Edge`, `Min EV`) + View Toggle -> PredictionsTable -> Pagination/Total items count (e.g., "Showing 11 matches").
- **Tables (Desktop & Mobile)**: Follows the same Desktop Table / Mobile Card breakdown as Value Bets.
- **Simple Mode Fields**: Match, Kickoff, Market Recommendation, Edge.
- **Detailed Mode Fields**: Match, Kickoff, Market, Lambda Home, Lambda Away, Model Prob, Implied Prob, EV, Edge.

### Page 4: Paper Bets (`/paper-bets`)
- **Layout**: Header with tabs: [Open] [Settled].
- **P&L Banner**: Prominent banner stretching across top width. `bg-[var(--color-card)] p-[var(--spacing-sm)] rounded-lg text-center border border-[var(--color-border)] mb-[var(--spacing-md)]`. Total P&L text color determined by positive (`text-[var(--color-positive)]`) or negative (`text-[var(--color-negative)]`) value.
- **Open Bets Tab**:
  - Fields: Match, Market, Odds, Model %, Edge, EV, Placed Date.
- **Settled Bets Tab**:
  - Fields: Match, Market, Odds, Result, Profit/Loss, Settled Date.
  - **Row Styling Rule**: Settled rows use color-coded background tints for readability at a glance. Winning rows get `bg-[var(--color-positive)]/5` with a subtle green border bottom. Losing rows get `bg-[var(--color-negative)]/5` with a red border bottom.
  - **Profit Column format**: `text-[var(--color-positive)]` (+R2.50) or `text-[var(--color-negative)]` (-R1.00).

### Page 5: How It Works (`/how-it-works`)
- **Layout**: Static article format bounded by a max-width container (`max-w-3xl mx-auto`) for comfortable reading.
- **Typography Structure**:
  - H1 (Page Title): "How It Works" (`text-2xl mt-4 mb-6`).
  - H2 (Section Titles): The Problem, Poisson Model, Finding Value, Expected Value, Data Sources (`text-lg text-[var(--color-primary)] mt-8 mb-4 border-b border-[var(--color-border)] pb-2`).
  - Body Text: `text-[var(--color-text-secondary)] leading-relaxed`.
- **Visuals**: Code blocks or math formula containers boxed in `bg-[var(--color-card)] rounded-lg p-[var(--spacing-md)] border border-[var(--color-border)] font-mono text-sm text-[var(--color-text)] overflow-x-auto`. Use Rands (R) in examples. Use real team names like "Arsenal" vs "Chelsea".
