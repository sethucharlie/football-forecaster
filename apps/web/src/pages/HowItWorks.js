import React from 'react';

/**
 * How It Works page — Route: /how-it-works
 * Static content. 5 sections with real team names and Rands.
 */
export default function HowItWorks() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mt-4 mb-6">How It Works</h1>

      {/* Section 1: The Problem */}
      <h2 className="text-lg text-[var(--color-primary)] mt-8 mb-4 border-b border-[var(--color-border)] pb-2 font-bold">
        The Problem
      </h2>
      <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
        Bookmakers set their odds using large teams of analysts and sophisticated models. These odds
        include a built-in profit margin (known as the "overround"), which means the implied
        probabilities of all outcomes sum to more than 100%. Most casual bettors rely on instinct or
        simple statistics, putting them at a systematic disadvantage.
      </p>
      <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
        Football Forecaster levels the playing field by using a statistical model to identify where
        bookmakers may have mispriced the odds — also known as finding <strong className="text-white">"value bets"</strong>.
      </p>

      {/* Section 2: The Poisson Model */}
      <h2 className="text-lg text-[var(--color-primary)] mt-8 mb-4 border-b border-[var(--color-border)] pb-2 font-bold">
        The Poisson Model
      </h2>
      <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
        We use a <strong className="text-white">Poisson regression model</strong> to predict the
        expected number of goals each team will score. The Poisson distribution models the probability
        of a given number of events (goals) occurring in a fixed interval.
      </p>
      <div className="bg-[var(--color-card)] rounded-lg p-[var(--spacing-md)] border border-[var(--color-border)] font-mono text-sm text-[var(--color-text)] overflow-x-auto mb-4">
        <p className="mb-2">P(X = k) = (λ^k × e^(-λ)) / k!</p>
        <p className="text-[var(--color-text-secondary)] text-xs mt-2">
          Where λ (lambda) is the expected number of goals for a team, and k is the actual number of goals.
        </p>
      </div>
      <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
        For example, if our model predicts Arsenal will score an average of <strong className="text-white">λ = 1.85</strong> goals
        and Chelsea will score <strong className="text-white">λ = 1.12</strong> goals, we can compute the probability
        of every possible scoreline (0-0, 1-0, 1-1, 2-1, etc.) and derive the probabilities for
        markets like Over/Under 2.5 Goals and Both Teams to Score.
      </p>

      {/* Section 3: Finding Value */}
      <h2 className="text-lg text-[var(--color-primary)] mt-8 mb-4 border-b border-[var(--color-border)] pb-2 font-bold">
        Finding Value
      </h2>
      <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
        A "value bet" exists when our model's probability for an outcome is <strong className="text-white">higher</strong> than
        what the bookmaker's odds imply. The difference is the <strong className="text-white">edge</strong>.
      </p>
      <div className="bg-[var(--color-card)] rounded-lg p-[var(--spacing-md)] border border-[var(--color-border)] font-mono text-sm text-[var(--color-text)] overflow-x-auto mb-4">
        <p className="mb-1">Match: Arsenal vs Chelsea</p>
        <p className="mb-1">Market: Over 2.5 Goals</p>
        <p className="mb-1">Bookmaker odds: 2.00 → Implied probability: 50.0%</p>
        <p className="mb-1">Model probability: 58.2%</p>
        <p className="text-[var(--color-positive)] font-bold">Edge: +8.2% ✓ (Value bet!)</p>
      </div>
      <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
        We only surface bets where the model identifies a positive edge, meaning we believe the
        true probability is higher than the bookmaker implies.
      </p>

      {/* Section 4: Expected Value */}
      <h2 className="text-lg text-[var(--color-primary)] mt-8 mb-4 border-b border-[var(--color-border)] pb-2 font-bold">
        Expected Value (EV)
      </h2>
      <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
        Expected Value tells you how much profit you can expect <strong className="text-white">per R1 staked</strong> over the
        long run. It's calculated as:
      </p>
      <div className="bg-[var(--color-card)] rounded-lg p-[var(--spacing-md)] border border-[var(--color-border)] font-mono text-sm text-[var(--color-text)] overflow-x-auto mb-4">
        <p className="mb-2">EV = (Model Probability × Odds) - 1</p>
        <p className="mb-1">Example: Arsenal vs Chelsea, Over 2.5 Goals</p>
        <p className="mb-1">EV = (0.582 × 2.00) - 1 = 0.164</p>
        <p className="text-[var(--color-positive)] font-bold">
          For every R1 staked, you expect R0.16 profit in the long run.
        </p>
      </div>
      <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
        A positive EV means the bet is theoretically profitable over many repetitions. Our paper bet
        tracker validates this by tracking hypothetical R1 flat-stake bets on every value opportunity.
      </p>

      {/* Section 5: Data Sources */}
      <h2 className="text-lg text-[var(--color-primary)] mt-8 mb-4 border-b border-[var(--color-border)] pb-2 font-bold">
        Data Sources
      </h2>
      <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
        Football Forecaster combines data from multiple trusted sources:
      </p>
      <ul className="list-disc list-inside text-[var(--color-text-secondary)] leading-relaxed mb-4 flex flex-col gap-2">
        <li>
          <strong className="text-white">Understat</strong> — Advanced match statistics including
          expected goals (xG), shots, and detailed team performance metrics for model training.
        </li>
        <li>
          <strong className="text-white">The Odds API</strong> — Real-time odds from major
          bookmakers to calculate implied probabilities and identify value.
        </li>
        <li>
          <strong className="text-white">football-data.org</strong> — Fixture schedules, results,
          and league standings for the English Premier League.
        </li>
      </ul>
      <p className="text-[var(--color-text-secondary)] leading-relaxed mb-8">
        Data is refreshed on Monday, Wednesday, and Friday to capture the latest odds movements and
        model recalibrations before upcoming match days.
      </p>
    </div>
  );
}
