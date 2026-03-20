-- 001_init_schema.sql

CREATE TABLE IF NOT EXISTS leagues (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,          -- e.g. "EPL", "ALLSV"
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  league_id INT NOT NULL REFERENCES leagues(id),
  name TEXT NOT NULL,
  UNIQUE (league_id, name)
);

-- Map different provider names (Understat vs football-data) to one canonical team
CREATE TABLE IF NOT EXISTS team_name_map (
  id SERIAL PRIMARY KEY,
  league_id INT NOT NULL REFERENCES leagues(id),
  provider TEXT NOT NULL,             -- e.g. "understat", "football_data"
  provider_team_name TEXT NOT NULL,
  team_id INT NOT NULL REFERENCES teams(id),
  UNIQUE (league_id, provider, provider_team_name)
);

CREATE TABLE IF NOT EXISTS matches (
  id BIGSERIAL PRIMARY KEY,
  league_id INT NOT NULL REFERENCES leagues(id),
  kickoff_utc TIMESTAMP NOT NULL,
  home_team_id INT NOT NULL REFERENCES teams(id),
  away_team_id INT NOT NULL REFERENCES teams(id),

  home_goals INT,
  away_goals INT,

  home_xg NUMERIC,
  away_xg NUMERIC,

  status TEXT NOT NULL DEFAULT 'scheduled',  -- scheduled|finished

  UNIQUE (league_id, kickoff_utc, home_team_id, away_team_id)
);

CREATE TABLE IF NOT EXISTS odds_markets (
  id BIGSERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  market TEXT NOT NULL,                -- "O2.5", "BTTS_YES"
  odds_decimal NUMERIC NOT NULL,
  bookmaker TEXT,                      -- optional
  captured_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (match_id, market, captured_at)
);

CREATE TABLE IF NOT EXISTS features (
  id BIGSERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  computed_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Keep it small for now; expand later
  home_roll_xg_for_5 NUMERIC,
  away_roll_xg_for_5 NUMERIC,
  home_roll_xg_against_5 NUMERIC,
  away_roll_xg_against_5 NUMERIC,

  days_rest_home INT,
  days_rest_away INT,

  UNIQUE (match_id)
);

CREATE TABLE IF NOT EXISTS predictions (
  id BIGSERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  market TEXT NOT NULL,                -- "O2.5" or "BTTS"
  model_version TEXT NOT NULL,         -- "poisson_v1"
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  model_probability NUMERIC NOT NULL,
  lambda_home NUMERIC,
  lambda_away NUMERIC,

  implied_probability NUMERIC,
  edge NUMERIC,
  ev NUMERIC,

  UNIQUE (match_id, market, model_version)
);

-- helpful indexes
CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON matches(kickoff_utc);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(match_id);