from typing import Any, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db import get_db
from app.services.pricing import (
    implied_probability_from_odds,
    compute_edge,
    compute_ev_decimal_odds,
)
from app.services.poisson_model import (
    estimate_lambdas,
    prob_over_total_goals,
    prob_btts,
)

router = APIRouter(prefix="/fixtures", tags=["fixtures"])


@router.get("/upcoming")
def upcoming_fixtures(league: str = "EPL", db: Session = Depends(get_db)):
    query = text("""
        SELECT
          m.id AS match_id,
          l.code AS league,
          ht.name AS home_team,
          at.name AS away_team,
          m.kickoff_utc,
          m.status
        FROM matches m
        JOIN leagues l ON m.league_id = l.id
        JOIN teams ht ON m.home_team_id = ht.id
        JOIN teams at ON m.away_team_id = at.id
        WHERE l.code = :league
          AND m.status = 'scheduled'
        ORDER BY m.kickoff_utc ASC
        LIMIT 20;
    """)
    rows = db.execute(query, {"league": league}).mappings().all()
    return {"count": len(rows), "fixtures": rows}


@router.get("/upcoming-with-odds")
def upcoming_with_odds(
    league: str = "EPL",
    markets: Optional[str] = None,
    min_ev: Optional[float] = None,
    min_edge: Optional[float] = None,
    db: Session = Depends(get_db),
):
    market_list = None
    if markets:
        market_list = [m.strip() for m in markets.split(",") if m.strip()]

    base_sql = """
        SELECT
          m.id AS match_id,
          l.code AS league,
          ht.name AS home_team,
          at.name AS away_team,
          m.kickoff_utc,
          m.status,
          om.market,
          om.odds_decimal
        FROM matches m
        JOIN leagues l ON m.league_id = l.id
        JOIN teams ht ON m.home_team_id = ht.id
        JOIN teams at ON m.away_team_id = at.id
        LEFT JOIN odds_markets om ON om.match_id = m.id
        WHERE l.code = :league
          AND m.status = 'scheduled'
    """

    params: dict[str, Any] = {"league": league}

    if market_list:
        base_sql += " AND (om.market = ANY(:markets))"
        params["markets"] = market_list

    base_sql += """
        ORDER BY m.kickoff_utc ASC, om.market ASC
        LIMIT 100;
    """

    rows = db.execute(text(base_sql), params).mappings().all()

    fixtures_by_id = {}

    for r in rows:
        mid = r["match_id"]

        if mid not in fixtures_by_id:
            fixtures_by_id[mid] = {
                "match_id": mid,
                "league": r["league"],
                "home_team": r["home_team"],
                "away_team": r["away_team"],
                "kickoff_utc": r["kickoff_utc"],
                "status": r["status"],
                "odds": [],
            }

        if r["market"] is None or r["odds_decimal"] is None:
            continue

        odds = float(r["odds_decimal"])
        implied = implied_probability_from_odds(odds)

        lam_home, lam_away = estimate_lambdas(
            db=db,
            league_code=league,
            home_team_id=r["home_team_id"],
            away_team_id=r["away_team_id"],
            kickoff_utc=r["kickoff_utc"],
            n=5,
     )

        market = r["market"]

        if market == "BTTS_YES":
            model_p = prob_btts(lam_home, lam_away)
        elif market == "BTTS_NO":
            model_p = 1.0 - prob_btts(lam_home, lam_away)
        elif market == "OU_15_OVER":
            model_p = prob_over_total_goals(1.5, lam_home, lam_away)
        elif market == "OU_15_UNDER":
             model_p = 1.0 - prob_over_total_goals(1.5, lam_home, lam_away)
        elif market == "OU_25_OVER":
             model_p = prob_over_total_goals(2.5, lam_home, lam_away)
        elif market == "OU_25_UNDER":
            model_p = 1.0 - prob_over_total_goals(2.5, lam_home, lam_away)
        elif market == "OU_35_OVER":
            model_p = prob_over_total_goals(3.5, lam_home, lam_away)
        elif market == "OU_35_UNDER":
            model_p = 1.0 - prob_over_total_goals(3.5, lam_home, lam_away)
        else:
            model_p = 0.50

        model_p = max(0.001, min(model_p, 0.999))
        edge = compute_edge(model_p, implied)
        ev = compute_ev_decimal_odds(model_p, odds, stake=1.0)

        if min_ev is not None and ev < min_ev:
            continue
        if min_edge is not None and edge < min_edge:
            continue

        fixtures_by_id[mid]["odds"].append({
            "market": r["market"],
            "odds_decimal": odds,
            "implied_probability": implied,
            "model_probability": model_p,
            "edge": edge,
            "expected_value": ev,
        })

    fixtures = list(fixtures_by_id.values())
    fixtures = [f for f in fixtures if len(f["odds"]) > 0]
    return {"count": len(fixtures), "fixtures": fixtures}
