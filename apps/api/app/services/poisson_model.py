import math
from typing import Optional

from sqlalchemy import text
from sqlalchemy.orm import Session


# --- Poisson math helpers ---

def poisson_pmf(k: int, lam: float) -> float:
    return math.exp(-lam) * (lam ** k) / math.factorial(k)


def poisson_cdf(k: int, lam: float) -> float:
    # P(X <= k)
    return sum(poisson_pmf(i, lam) for i in range(0, k + 1))


def prob_over_total_goals(line: float, lam_home: float, lam_away: float) -> float:
    """
    If home and away goals are independent Poisson:
      total goals ~ Poisson(lam_home + lam_away)
    Over 2.5 means total >= 3.
    """
    lam_total = lam_home + lam_away
    # total >= floor(line)+1 when line is .5
    k = int(math.floor(line))
    return 1.0 - poisson_cdf(k, lam_total)


def prob_btts(lam_home: float, lam_away: float) -> float:
    """
    BTTS = P(home>=1 AND away>=1)
         = 1 - P(home=0) - P(away=0) + P(both=0)
    """
    p_home_0 = math.exp(-lam_home)
    p_away_0 = math.exp(-lam_away)
    p_both_0 = math.exp(-(lam_home + lam_away))
    return 1.0 - p_home_0 - p_away_0 + p_both_0


# --- Lambda estimation (simple baseline, no leakage) ---

def estimate_team_avgs_last_n(
    db: Session,
    league_code: str,
    team_id: int,
    kickoff_utc,
    n: int = 5,
) -> tuple[Optional[float], Optional[float]]:
    """
    Returns (avg_scored, avg_conceded) over last n finished matches
    BEFORE kickoff_utc. This avoids leakage.
    """
    q = text("""
        SELECT
          m.home_team_id,
          m.away_team_id,
          m.home_goals,
          m.away_goals
        FROM matches m
        JOIN leagues l ON m.league_id = l.id
        WHERE l.code = :league
          AND m.status = 'finished'
          AND m.kickoff_utc < :kickoff
          AND (m.home_team_id = :team_id OR m.away_team_id = :team_id)
        ORDER BY m.kickoff_utc DESC
        LIMIT :n;
    """)
    rows = db.execute(q, {
        "league": league_code,
        "kickoff": kickoff_utc,
        "team_id": team_id,
        "n": n,
    }).mappings().all()

    if not rows:
        return (None, None)

    scored: list[int] = []
    conceded: list[int] = []

    for r in rows:
        if r["home_team_id"] == team_id:
            scored.append(int(r["home_goals"]))
            conceded.append(int(r["away_goals"]))
        else:
            scored.append(int(r["away_goals"]))
            conceded.append(int(r["home_goals"]))

    avg_scored = sum(scored) / len(scored)
    avg_conceded = sum(conceded) / len(conceded)
    return (avg_scored, avg_conceded)


def league_goal_baseline(db: Session, league_code: str, kickoff_utc) -> tuple[float, float]:
    """
    League average goals per team per match (before kickoff_utc).
    We use it as a fallback / stabilizer.
    """
    q = text("""
        SELECT
          AVG(m.home_goals) AS avg_home_goals,
          AVG(m.away_goals) AS avg_away_goals
        FROM matches m
        JOIN leagues l ON m.league_id = l.id
        WHERE l.code = :league
          AND m.status = 'finished'
          AND m.kickoff_utc < :kickoff;
    """)
    row = db.execute(q, {"league": league_code, "kickoff": kickoff_utc}).mappings().one()

    avg_home = float(row["avg_home_goals"] or 1.35)
    avg_away = float(row["avg_away_goals"] or 1.10)
    return avg_home, avg_away


def estimate_lambdas(
    db: Session,
    league_code: str,
    home_team_id: int,
    away_team_id: int,
    kickoff_utc,
    n: int = 5,
) -> tuple[float, float]:
    """
    Simple strength model:
      home_lambda ~= (home_avg_scored + away_avg_conceded)/2, nudged by league home baseline
      away_lambda ~= (away_avg_scored + home_avg_conceded)/2, nudged by league away baseline
    """

    league_home_base, league_away_base = league_goal_baseline(db, league_code, kickoff_utc)

    home_scored, home_conceded = estimate_team_avgs_last_n(db, league_code, home_team_id, kickoff_utc, n=n)
    away_scored, away_conceded = estimate_team_avgs_last_n(db, league_code, away_team_id, kickoff_utc, n=n)

    # If history is missing, fallback to league baseline.
    if (
        home_scored is None
        or home_conceded is None
        or away_scored is None
        or away_conceded is None
    ):
        return (league_home_base, league_away_base)

    # Type is narrowed to float after the None checks above.
    lam_home = (home_scored + away_conceded) / 2.0
    lam_away = (away_scored + home_conceded) / 2.0

    # Nudge toward league baseline so lambdas do not overreact to small samples.
    lam_home = (lam_home + league_home_base) / 2.0
    lam_away = (lam_away + league_away_base) / 2.0

    # Clamp to sane bounds.
    lam_home = max(0.2, min(lam_home, 3.5))
    lam_away = max(0.2, min(lam_away, 3.5))

    return (lam_home, lam_away)
