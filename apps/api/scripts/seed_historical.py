import os
import asyncio
import aiohttp
import understat
from pathlib import Path
from datetime import datetime
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
assert DATABASE_URL, "DATABASE_URL not found in .env"
engine = create_engine(DATABASE_URL)

def seed_league(conn):
    conn.execute(text("""
        INSERT INTO leagues (code, name)
        VALUES (:code, :name)
        ON CONFLICT (code) DO NOTHING;
    """), {"code": "EPL", "name": "English Premier League"})
    print("League seeded")

async def seed_season(conn, season):
    league_id = conn.execute(text(
        "SELECT id FROM leagues WHERE code = 'EPL'"
    )).scalar()

    connector = aiohttp.TCPConnector(use_dns_cache=False, family= 0)
    async with aiohttp.ClientSession(connector=connector) as session:
        u = understat.Understat(session)
        matches = await u.get_league_results("EPL", season)

    teams_inserted = 0
    matches_inserted = 0
    team_map = {}

    # First pass — seed teams
    for match in matches:
        for side in ["h", "a"]:
            name = match[side]["title"]
            if name not in team_map:
                conn.execute(text("""
                    INSERT INTO teams (league_id, name)
                    VALUES (:league_id, :name)
                    ON CONFLICT (league_id, name) DO NOTHING
                    RETURNING id;
                """), {"league_id": league_id, "name": name})

                team_id = conn.execute(text(
                    "SELECT id FROM teams WHERE league_id = :league_id AND name = :name"
                ), {"league_id": league_id, "name": name}).scalar()

                team_map[name] = team_id
                teams_inserted += 1

    # Second pass — seed matches
    for match in matches:
        if not match["isResult"]:
            continue

        home_name = match["h"]["title"]
        away_name = match["a"]["title"]

        conn.execute(text("""
            INSERT INTO matches (
                league_id, kickoff_utc,
                home_team_id, away_team_id,
                home_goals, away_goals,
                home_xg, away_xg,
                status
            )
            VALUES (
                :league_id, :kickoff_utc,
                :home_team_id, :away_team_id,
                :home_goals, :away_goals,
                :home_xg, :away_xg,
                'finished'
            )
            ON CONFLICT (league_id, kickoff_utc, home_team_id, away_team_id)
            DO NOTHING;
        """), {
            "league_id": league_id,
            "kickoff_utc": datetime.strptime(match["datetime"], "%Y-%m-%d %H:%M:%S"),
            "home_team_id": team_map[home_name],
            "away_team_id": team_map[away_name],
            "home_goals": int(match["goals"]["h"]),
            "away_goals": int(match["goals"]["a"]),
            "home_xg": float(match["xG"]["h"]),
            "away_xg": float(match["xG"]["a"]),
        })
        matches_inserted += 1

    print(f"Season {season}: {teams_inserted} teams, {matches_inserted} matches")

async def main():
    SEASONS = [2019, 2020, 2021, 2022, 2023, 2024, 2025]

    print("Starting historical seed...")

    with engine.connect() as conn:
        seed_league(conn)

        for season in SEASONS:
            print(f"Processing season {season}...")
            await seed_season(conn, season)

        conn.commit()

    print("Done!")

if __name__ == "__main__":
    asyncio.run(main())