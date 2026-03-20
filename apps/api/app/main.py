from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import get_db
from app.routes.fixtures import router as fixtures_router
from app.routes.predictions import router as predictions_router
from app.routes.paper_bets import router as paper_bets_router
    
#register routers
app = FastAPI(title="Football Forecasting API")

app.include_router(fixtures_router)
app.include_router(predictions_router)
app.include_router(paper_bets_router)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    # Smallest possible query: can we read something from DB?
    row = db.execute(text("SELECT NOW() AS server_time;")).mappings().one()
    return {"db_server_time": str(row["server_time"])}

