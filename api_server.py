"""
Simple API Server for HFT Model
Serves predictions via REST API for dashboard
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
from pathlib import Path

# Import our model
from model import HFTModel

app = FastAPI(title="HFT Trading API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model
MODEL = None

class PredictRequest(BaseModel):
    symbol: str
    window_seconds: Optional[int] = 128

@app.on_event("startup")
def startup():
    global MODEL
    MODEL = HFTModel()
    MODEL.load_ensemble("models/ensemble")
    print("✅ API Server Ready")

@app.get("/health")
def health():
    return {
        "status": "ok",
        "ensemble_loaded": MODEL.is_loaded,
        "n_models": len(MODEL.ensemble.base_models) if MODEL.is_loaded else 0
    }

@app.get("/stats")
def stats():
    import pandas as pd
    df = pd.read_csv("processed/combined_1s.csv", parse_dates=["datetime"])
    return {
        "total_ticks": len(df),
        "symbols": int(df["symbol"].nunique()),
        "date_range": {
            "start": str(df["datetime"].min()),
            "end": str(df["datetime"].max())
        },
        "model_loaded": MODEL.is_loaded,
        "model_type": "ensemble"
    }

@app.post("/predict")
def predict(req: PredictRequest):
    if not MODEL.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        result = MODEL.predict(req.symbol)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ensemble/info")
def ensemble_info():
    if not MODEL.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return MODEL.get_model_info()

@app.get("/symbols")
def get_symbols():
    import pandas as pd
    df = pd.read_csv("processed/combined_1s.csv")
    symbols = sorted(df["symbol"].unique().tolist())
    return {"symbols": symbols}

@app.get("/history/{symbol}")
def get_history(symbol: str, points: int = 100):
    """Get historical data for a symbol"""
    try:
        import pandas as pd
        df = pd.read_csv("processed/combined_1s.csv", parse_dates=["datetime"])
        df_sym = df[df["symbol"] == symbol].sort_values("datetime").tail(points)
        
        if len(df_sym) == 0:
            raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")
        
        # Format data for frontend charts
        history_data = []
        for _, row in df_sym.iterrows():
            history_data.append({
                "timestamp": str(row["datetime"]),
                "price": float(row["price"]),
                "volume": int(row.get("volume", 0)) if not pd.isna(row.get("volume", 0)) else 0
            })
        
        return {
            "symbol": symbol,
            "data": history_data,
            "points": len(history_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/backtest/results")
def backtest_results():
    # Mock backtest results for dashboard
    return {
        "report": {
            "total_return_pct": 53.2,
            "win_rate": 0.65,
            "sharpe_ratio": 1.89,
            "closed_trades": 1247,
            "profit_factor": 2.34,
            "max_drawdown_pct": -8.5
        },
        "recent_trades": []
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
