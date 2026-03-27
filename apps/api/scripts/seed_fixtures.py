import os
import time
import requests
from pathlib import Path
from datetime import datetime
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
FOOTBALL_DATA_KEY = os.getenv("FOOTBALL_DATA_KEY")
ODDS_API_KEY = os.getenv("ODDS_API_KEY")

assert DATABASE_URL, "DATABASE_URL not found in .env"
assert FOOTBALL_DATA_KEY, "FOOTBALL_DATA_KEY not found in .env"
assert ODDS_API_KEY, "ODDS_API_KEY not found in .env"

engine = create_engine(DATABASE_URL)

FD_HEADERS = {"X-Auth-Token": FOOTBALL_DATA_KEY}
FD_BASE_URL = "https://api.football-data.org/v4"
ODDS_BASE_URL = "https://api.the-odds-api.com/v4"

def seed_fixtures(conn):
    league_id = conn.execute(text(
        "SELECT id FROM leagues WHERE code = 'EPL'"
    )).scalar()

    rows = conn.execute(text(
        "SELECT id, name FROM teams WHERE league_id = :league_id"
    ), {"league_id": league_id}).mappings().all()
    
    team_map = {row["name"]: row["id"] for row in rows}

    # Pull upcoming fixtures
    url = f"{FD_BASE_URL}/competitions/PL/matches?status=SCHEDULED"
    response = requests.get(url, headers=FD_HEADERS)
    data = response.json()
    time.sleep(6)

    inserted = 0

    for match in data.get("matches", []):
        home_name = match["homeTeam"]["name"]
        away_name = match["awayTeam"]["name"]

        # Strip common suffixes for fuzzy matching
        home_search = home_name.replace(" FC", "").replace(" AFC", "").strip()
        away_search = away_name.replace(" FC", "").replace(" AFC", "").strip()

        home_id = conn.execute(text(
        "SELECT id FROM teams WHERE name ILIKE :name AND league_id = :league_id"
        ), {"name": f"%{home_search}%", "league_id": league_id}).scalar()

        away_id = conn.execute(text(
        "SELECT id FROM teams WHERE name ILIKE :name AND league_id = :league_id"
        ), {"name": f"%{away_search}%", "league_id": league_id}).scalar()

        if not home_id or not away_id:
            print(f"Skipping: {home_name} vs {away_name}")
            continue

        conn.execute(text("""
            INSERT INTO matches (
                league_id, kickoff_utc,
                home_team_id, away_team_id,
                status
            )
            VALUES (
                :league_id, :kickoff_utc,
                :home_team_id, :away_team_id,
                'scheduled'
            )
            ON CONFLICT (league_id, kickoff_utc, home_team_id, away_team_id)
            DO NOTHING;
        """), {
            "league_id": league_id,
            "kickoff_utc": datetime.fromisoformat(match["utcDate"].replace("Z", "+00:00")),
            "home_team_id": home_id,
            "away_team_id": away_id,
        })
        inserted += 1

    print(f"Fixtures seeded: {inserted} upcoming matches")
    return inserted

def _map_market(market_key: str, outcome: dict) -> str | None:
    name = outcome["name"]
    point = outcome.get("point", "")

    if market_key == "totals":
        if point == 1.5:
            return f"OU_15_{'OVER' if name == 'Over' else 'UNDER'}"
        elif point == 2.5:
            return f"OU_25_{'OVER' if name == 'Over' else 'UNDER'}"
        elif point == 3.5:
            return f"OU_35_{'OVER' if name == 'Over' else 'UNDER'}"

    if market_key == "btts":
        if name == "Yes":
            return "BTTS_YES"
        elif name == "No":
            return "BTTS_NO"

    return None

def seed_odds(conn):
    # Pull upcoming EPL odds
    url = (
        f"{ODDS_BASE_URL}/sports/soccer_epl/odds"
        f"?apiKey={ODDS_API_KEY}"
        f"&regions=uk"
        f"&markets=totals"
        f"&oddsFormat=decimal"
    )
    response = requests.get(url)
    data = response.json()

    if not isinstance(data, list):
        print(f"Odds API error: {data}")
        return 0

    inserted = 0

    for game in data:
        home_name = game["home_team"]
        away_name = game["away_team"]
        commence_time = datetime.fromisoformat(
            game["commence_time"].replace("Z", "+00:00")
        )

        # Find match in database
        match_id = conn.execute(text("""
            SELECT m.id FROM matches m
            JOIN teams ht ON m.home_team_id = ht.id
            JOIN teams at ON m.away_team_id = at.id
            WHERE ht.name ILIKE :home
            AND at.name ILIKE :away
            AND m.status = 'scheduled'
        """), {
            "home": f"%{home_name}%",
            "away": f"%{away_name}%",
        }).scalar()

        if not match_id:
            print(f"No match found for: {home_name} vs {away_name}")
            continue

        for bookmaker in game.get("bookmakers", [])[:1]:
            for market in bookmaker.get("markets", []):
                for outcome in market.get("outcomes", []):
                    market_key = _map_market(market["key"], outcome)
                    if not market_key:
                        continue

                    conn.execute(text("""
                        INSERT INTO odds_markets (match_id, market, odds_decimal, bookmaker)
                        VALUES (:match_id, :market, :odds, :bookmaker)
                        ON CONFLICT (match_id, market, captured_at) DO NOTHING;
                    """), {
                        "match_id": match_id,
                        "market": market_key,
                        "odds": float(outcome["price"]),
                        "bookmaker": bookmaker["title"],
                    })
                    inserted += 1

    print(f"Odds seeded: {inserted} markets")
    return inserted

if __name__ == "__main__":
    print("Seeding fixtures and odds...")

    with engine.connect() as conn:
        seed_fixtures(conn)
        seed_odds(conn)
        conn.commit()

    print("Done!")