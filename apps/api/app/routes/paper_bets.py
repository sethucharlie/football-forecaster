from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db import get_db
from app.services.grading import grade_prediction

router = APIRouter(prefix="/paper-bets", tags=["paper-bets"])


@router.post("/place")
def place_paper_bets(
    league: str = "EPL",
    model_version: str =  "poisson_v1",
    min_ev: float = 0.03,
    stake: float = 1.0,
    db: Session = Depends(get_db),
):
    """
    Place paper bets using predictions that meet EV threshold.
    Copies prediction info directly into paper_bets table.
    """

    q = text("""
        SELECT
            p.match_id,
            p.market,
            p.model_version,
            (1.0 / p.implied_probability) AS odds_decimal,
            p.model_probability,
            p.implied_probability,
            p.edge,
            p.ev
        FROM predictions p
        JOIN matches m ON p.match_id = m.id
        JOIN leagues l ON m.league_id = l.id
        WHERE l.code = :league
          AND p.model_version = :model_version
          AND p.ev >= :min_ev
          AND m.status = 'scheduled'
          AND NOT EXISTS (
                SELECT 1 FROM paper_bets pb
                WHERE pb.match_id = p.match_id
                AND pb.market = p.market
                AND pb.model_version = p.model_version
          )
    """)

    rows = db.execute(q, {
        "league": league,
        "model_version": model_version,
        "min_ev": min_ev
    }).mappings().all()

    if not rows:
        return {"placed": 0}

    insert_q = text("""
        INSERT INTO paper_bets (
            match_id,
            market,
            model_version,
            odds_decimal,
            model_probability,
            implied_probability,
            edge,
            ev,
            stake,
            placed_at,
            created_at
        )
        VALUES (
            :match_id,
            :market,
            :model_version,
            :odds_decimal,
            :model_probability,
            :implied_probability,
            :edge,
            :ev,
            :stake,
            :placed_at,
            :created_at
        )
    """)

    now = datetime.utcnow()

    for r in rows:
        db.execute(insert_q, {
            **r,
            "stake": stake,
            "placed_at": now,
            "created_at": now
        })

    db.commit()

    return {"placed": len(rows)}


@router.post("/settle")
def settle_paper_bets(db: Session = Depends(get_db)):

    q = text("""
        SELECT
            pb.id,
            pb.market,
            pb.stake,
            pb.odds_decimal,
            m.home_goals,
            m.away_goals
        FROM paper_bets pb
        JOIN matches m ON pb.match_id = m.id
        WHERE pb.settled_at IS NULL
        AND m.status = 'finished'
    """)

    rows = db.execute(q).mappings().all()

    if not rows:
        return {"settled": 0}

    update_q = text("""
        UPDATE paper_bets
        SET
            result = :result,
            profit = :profit,
            settled_at = :settled_at
        WHERE id = :id
    """)

    now = datetime.utcnow()
    total_profit = 0

    for r in rows:

        win = grade_prediction(
            r["market"],
            r["home_goals"],
            r["away_goals"]
        )

        stake = float(r["stake"])

        if win == 1:
            profit = stake * (float(r["odds_decimal"]) - 1)
        else:
            profit = -stake

        total_profit += profit

        db.execute(update_q, {
            "id": r["id"],
            "result": win,
            "profit": profit,
            "settled_at": now
        })

    db.commit()

    return {
        "settled": len(rows),
        "total_profit": total_profit
    }

@router.get("/summary")
def paper_bet_summary(db: Session = Depends(get_db)):

    q = text("""
        SELECT
            COUNT(*) as total_bets,
            SUM(stake) as total_staked,
            SUM(profit) as total_profit,
            AVG(edge) as avg_edge,
            SUM(CASE WHEN result = '1' THEN 1 ELSE 0 END) as wins
        FROM paper_bets
        WHERE settled_at IS NOT NULL
    """)

    row = db.execute(q).mappings().first()

    if not row or row["total_bets"] == 0:
        return {"message": "No settled bets yet"}

    roi = float(row["total_profit"]) / float(row["total_staked"])

    win_rate = float(row["wins"]) / float(row["total_bets"])

    return {
        "total_bets": row["total_bets"],
        "total_staked": float(row["total_staked"]),
        "total_profit": float(row["total_profit"]),
        "roi": roi,
        "win_rate": win_rate,
        "avg_edge": float(row["avg_edge"])
    }

@router.get("/equity")
def equity_curve(db: Session = Depends(get_db)):

    q = text("""
        SELECT
            DATE(settled_at) as day,
            SUM(profit) as daily_profit
        FROM paper_bets
        WHERE settled_at IS NOT NULL
        GROUP BY DATE(settled_at)
        ORDER BY day
    """)

    rows = db.execute(q).mappings().all()

    equity = 0
    curve = []

    for r in rows:
        equity += float(r["daily_profit"])
        curve.append({
            "date": r["day"],
            "equity": equity
        })

    return curve


@router.get("/list")
def list_paper_bets(
    status: str = "all",
    db: Session = Depends(get_db),
):
    """
    Returns individual paper bets with team names.
    Query param 'status': 'open', 'settled', or 'all' (default).
    """

    base_sql = """
        SELECT
            pb.id,
            pb.match_id,
            ht.name AS home_team,
            at.name AS away_team,
            m.kickoff_utc,
            pb.market,
            pb.model_version,
            pb.odds_decimal,
            pb.model_probability,
            pb.implied_probability,
            pb.edge,
            pb.ev,
            pb.stake,
            pb.placed_at,
            pb.result,
            pb.profit,
            pb.settled_at
        FROM paper_bets pb
        JOIN matches m ON pb.match_id = m.id
        JOIN teams ht ON m.home_team_id = ht.id
        JOIN teams at ON m.away_team_id = at.id
    """

    if status == "open":
        base_sql += " WHERE pb.settled_at IS NULL"
    elif status == "settled":
        base_sql += " WHERE pb.settled_at IS NOT NULL"

    base_sql += " ORDER BY pb.placed_at DESC LIMIT 200;"

    rows = db.execute(text(base_sql)).mappings().all()

    bets = []
    for r in rows:
        bets.append({
            "id": r["id"],
            "match_id": r["match_id"],
            "home_team": r["home_team"],
            "away_team": r["away_team"],
            "kickoff_utc": r["kickoff_utc"].isoformat() if r["kickoff_utc"] else None,
            "market": r["market"],
            "model_version": r["model_version"],
            "odds_decimal": float(r["odds_decimal"]) if r["odds_decimal"] else None,
            "model_probability": float(r["model_probability"]) if r["model_probability"] else None,
            "implied_probability": float(r["implied_probability"]) if r["implied_probability"] else None,
            "edge": float(r["edge"]) if r["edge"] else None,
            "ev": float(r["ev"]) if r["ev"] else None,
            "stake": float(r["stake"]) if r["stake"] else None,
            "placed_at": r["placed_at"].isoformat() if r["placed_at"] else None,
            "result": r["result"],
            "profit": float(r["profit"]) if r["profit"] is not None else None,
            "settled_at": r["settled_at"].isoformat() if r["settled_at"] else None,
        })

    return {"count": len(bets), "bets": bets}


@router.get("/summary-by-market")
def summary_by_market(db: Session = Depends(get_db)):
    """
    Returns per-market breakdown: count, wins, win_rate, total_profit, roi.
    Used for Performance page bar charts.
    """

    q = text("""
        SELECT
            market,
            COUNT(*) as total_bets,
            SUM(stake) as total_staked,
            SUM(profit) as total_profit,
            SUM(CASE WHEN result = '1' THEN 1 ELSE 0 END) as wins
        FROM paper_bets
        WHERE settled_at IS NOT NULL
        GROUP BY market
        ORDER BY market
    """)

    rows = db.execute(q).mappings().all()

    if not rows:
        return {"message": "No settled bets yet"}

    markets = []
    for r in rows:
        total = int(r["total_bets"])
        staked = float(r["total_staked"])
        profit = float(r["total_profit"])
        wins = int(r["wins"])

        markets.append({
            "market": r["market"],
            "total_bets": total,
            "wins": wins,
            "win_rate": wins / total if total > 0 else 0,
            "total_profit": profit,
            "roi": profit / staked if staked > 0 else 0,
        })

    return {"markets": markets}