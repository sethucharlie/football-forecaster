from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import get_db
from app.services.pricing import (
    mock_model_probability,
    implied_probability_from_odds,
    compute_edge,
    compute_ev_decimal_odds,
)
from app.services.grading import grade_prediction
from app.services.poisson_model import (
    estimate_lambdas,
    prob_over_total_goals,
    prob_btts,
)
from typing import Optional


router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.post("/generate")
def generate_predictions(
    league: str = "EPL",
    model_version: str = "mock_v1",
    db: Session = Depends(get_db),
):
    """
    Generates predictions for scheduled matches with odds and stores them.
    (Mock probabilities for now; real model later.)
    """

    # 1) Pull scheduled matches + odds
    q = text("""
    SELECT
      m.id AS match_id,
      l.code AS league,
      m.kickoff_utc,
      m.home_team_id,
      m.away_team_id,
      om.market,
      om.odds_decimal
    FROM matches m
    JOIN leagues l ON m.league_id = l.id
    JOIN odds_markets om ON om.match_id = m.id
    WHERE l.code = :league
      AND m.status = 'scheduled'
      AND om.market IS NOT NULL
      AND om.odds_decimal IS NOT NULL
    ORDER BY m.id ASC, om.market ASC;
""")
    rows = db.execute(q, {"league": league}).mappings().all()

    if not rows:
        return {"inserted": 0, "message": "No scheduled matches with odds found."}

    now = datetime.now(timezone.utc)
    inserted = 0

    # 2) Insert predictions
    insert_q = text("""
    INSERT INTO predictions (
        match_id, market, model_version, created_at,
        model_probability, lambda_home, lambda_away,
        implied_probability, edge, ev
    )
    VALUES (
        :match_id, :market, :model_version, :created_at,
        :model_probability, :lambda_home, :lambda_away,
        :implied_probability, :edge, :ev
    )
    ON CONFLICT (match_id, market, model_version)
    DO UPDATE SET
        created_at = EXCLUDED.created_at,
        model_probability = EXCLUDED.model_probability,
        lambda_home = EXCLUDED.lambda_home,
        lambda_away = EXCLUDED.lambda_away,
        implied_probability = EXCLUDED.implied_probability,
        edge = EXCLUDED.edge,
        ev = EXCLUDED.ev;
    """)

    for r in rows:
        odds = float(r["odds_decimal"])
        implied = implied_probability_from_odds(odds)

        market = r["market"]

    # 1) Estimate expected goals (lambdas) from past data (no leakage)
        lam_home, lam_away = estimate_lambdas(
        db=db,
        league_code=league,              # the league param passed into endpoint
        home_team_id=r["home_team_id"],
        away_team_id=r["away_team_id"],
        kickoff_utc=r["kickoff_utc"],
        n=5,
    )

    # 2) Convert lambdas into a probability depending on the market
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
            model_p = 0.50  # fallback for any unexpected market

    # optional safety clamp so probability never goes weird
        model_p = max(0.001, min(model_p, 0.999))

    # 3) Pricing metrics
        edge = compute_edge(model_p, implied)
        ev = compute_ev_decimal_odds(model_p, odds, stake=1.0)

    # 4) Store prediction
        db.execute(insert_q, {
            "match_id": r["match_id"],
            "market": market,
            "model_version": model_version,
            "created_at": now,
            "model_probability": model_p,
            "lambda_home": lam_home,
            "lambda_away": lam_away,
            "implied_probability": implied,
            "edge": edge,
            "ev": ev,
        })
        inserted += 1

    db.commit()
    return {"inserted": inserted, "model_version": model_version, "created_at": now.isoformat()}

@router.get("/latest")
def latest_predictions(
    league: str = "EPL",
    model_version: str = "poisson_v1",
    markets: Optional[str] = None,
    min_ev: Optional[float] = None,
    min_edge: Optional[float] = None,
    db: Session = Depends(get_db),
):
    # optional markets filter: markets=OU_25_OVER,BTTS_YES
    market_list = None
    if markets:
        market_list = [m.strip() for m in markets.split(",") if m.strip()]

    # This CTE selects the latest row per (match_id, market, model_version)
    sql = """
    WITH latest AS (
      SELECT DISTINCT ON (p.match_id, p.market, p.model_version)
        p.*
      FROM predictions p
      ORDER BY p.match_id, p.market, p.model_version, p.created_at DESC
    )
    SELECT
      m.id AS match_id,
      l.code AS league,
      ht.name AS home_team,
      at.name AS away_team,
      m.kickoff_utc,
      m.status,
      latest.market,
      latest.model_version,
      latest.created_at,
      latest.lambda_home,
      latest.lambda_away,
      latest.model_probability,
      latest.implied_probability,
      latest.edge,
      latest.ev
    FROM matches m
    JOIN leagues l ON m.league_id = l.id
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    JOIN latest ON latest.match_id = m.id
    WHERE l.code = :league
      AND m.status = 'scheduled'
      AND latest.model_version = :model_version
    """

    params: dict[str, Any] = {"league": league, "model_version": model_version}

    if market_list:
        sql += " AND latest.market = ANY(:markets)"
        params["markets"] = market_list

    if min_ev is not None:
        sql += " AND latest.ev >= :min_ev"
        params["min_ev"] = min_ev

    if min_edge is not None:
        sql += " AND latest.edge >= :min_edge"
        params["min_edge"] = min_edge

    sql += " ORDER BY m.kickoff_utc ASC, latest.market ASC LIMIT 500;"

    rows = db.execute(text(sql), params).mappings().all()

    fixtures_by_id: dict[int, dict] = {}

    for r in rows:
        mid = int(r["match_id"])

        if mid not in fixtures_by_id:
            fixtures_by_id[mid] = {
            "match_id": mid,
            "league": r["league"],
            "home_team": r["home_team"],
            "away_team": r["away_team"],
            "kickoff_utc": r["kickoff_utc"].isoformat() if r["kickoff_utc"] else None,
            "status": r["status"],
            "model_version": r["model_version"],
            "created_at": r["created_at"].isoformat() if r["created_at"] else None,
            "markets": [],
        }

        fixtures_by_id[mid]["markets"].append({
        "market": r["market"],
        "lambda_home": float(r["lambda_home"]) if r["lambda_home"] is not None else None,
        "lambda_away": float(r["lambda_away"]) if r["lambda_away"] is not None else None,
        "odds_implied_probability": float(r["implied_probability"]) if r["implied_probability"] is not None else None,
        "model_probability": float(r["model_probability"]) if r["model_probability"] is not None else None,
        "edge": float(r["edge"]) if r["edge"] is not None else None,
        "ev": float(r["ev"]) if r["ev"] is not None else None,
    })

    fixtures = list(fixtures_by_id.values())

    return {"count": len(fixtures), "fixtures": fixtures}
    
@router.get("/upcoming")
def upcoming_predictions(
    league: str = "EPL",
    min_ev: float | None = None,
    min_edge: float | None = None,
    db: Session = Depends(get_db),
):
    """
    Returns stored predictions for scheduled matches.
    Does NOT recompute anything.
    """

    base_sql = """
        SELECT
            m.id AS match_id,
            l.code AS league,
            ht.name AS home_team,
            at.name AS away_team,
            m.kickoff_utc,
            p.market,
            p.model_version,
            p.model_probability,
            p.implied_probability,
            p.edge,
            p.ev
        FROM predictions p
        JOIN matches m ON p.match_id = m.id
        JOIN leagues l ON m.league_id = l.id
        JOIN teams ht ON m.home_team_id = ht.id
        JOIN teams at ON m.away_team_id = at.id
        WHERE l.code = :league
          AND m.status = 'scheduled'
    """

    params: dict[str, Any] = {"league": league}

    if min_ev is not None:
        base_sql += " AND p.ev >= :min_ev"
        params["min_ev"] = min_ev

    if min_edge is not None:
        base_sql += " AND p.edge >= :min_edge"
        params["min_edge"] = min_edge

    base_sql += " ORDER BY m.kickoff_utc ASC, p.market ASC;"

    rows = db.execute(text(base_sql), params).mappings().all()

    return {"count": len(rows), "predictions": rows}

@router.post("/grade")
def grade_finished_predictions(db: Session = Depends(get_db)):
    """
    Grades predictions for matches marked as 'finished'.
    Returns win/loss + simulated profit.
    """

    q = text("""
        SELECT
            p.id,
            p.match_id,
            p.market,
            p.ev,
            p.model_probability,
            p.implied_probability,
            p.edge,
            m.home_goals,
            m.away_goals
        FROM predictions p
        JOIN matches m ON p.match_id = m.id
        WHERE m.status = 'finished'
          AND m.home_goals IS NOT NULL
          AND m.away_goals IS NOT NULL;
    """)

    rows = db.execute(q).mappings().all()

    results = []
    total_profit = 0
    stake = 1.0

    for r in rows:
        win = grade_prediction(
            r["market"],
            r["home_goals"],
            r["away_goals"]
        )

        # simulate 1 unit stake
        if win == 1:
            # retrieve original odds from implied_probability
            odds = 1.0 / float(r["implied_probability"])
            profit = stake * (odds - 1.0)
        else:
            profit = -stake

        total_profit += profit

        results.append({
            "prediction_id": r["id"],
            "market": r["market"],
            "win": win,
            "profit": profit
        })

    return {
        "graded": len(results),
        "total_profit": total_profit,
        "details": results
    }
