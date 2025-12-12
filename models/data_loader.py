"""Data loader utilities to create sliding windows from processed CSVs.

This provides a simple `load_windows` helper that yields (X_seq, X_ind, y_cls, y_reg).
"""
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Tuple, Optional


def load_windows(processed_csv: str, window: int = 128, n_indicators: int = 10, step: int = 1):
    p = Path(processed_csv)
    if not p.exists():
        raise FileNotFoundError(f"Processed file not found: {processed_csv}")

    df = pd.read_csv(p, parse_dates=["datetime"]) 
    # For simplicity use price and some precomputed features if present
    if "price" not in df.columns:
        raise ValueError("processed CSV must contain 'price' column")

    # pivot by time order only; in production keep symbol separation
    prices = df["price"].values.astype(float)

    # indicators: pick a canonical set if present
    preferred = ["return_1s", "return_5s", "volatility_60s", "ema_8", "ema_21", "rsi_14", "macd", "macd_signal", "atr_14", "vwap_60"]
    ind_cols = [c for c in preferred if c in df.columns]
    if not ind_cols:
        # fallback to any numeric columns excluding price
        ind_cols = [c for c in df.select_dtypes(include="number").columns if c != "price"][:n_indicators]

    if ind_cols:
        indicators = df[ind_cols].fillna(0).values
        # if fewer than n_indicators, pad with zeros
        if indicators.shape[1] < n_indicators:
            pad = np.zeros((len(df), n_indicators - indicators.shape[1]))
            indicators = np.concatenate([indicators, pad], axis=1)
    else:
        indicators = np.zeros((len(df), n_indicators))

    X_seq, X_ind, y_cls, y_reg = [], [], [], []
    for start in range(0, len(prices) - window - 5, step):
        end = start + window
        seq = prices[start:end]
        # standardize sequence
        seq = (seq - seq.mean()) / (seq.std() + 1e-8)
        X_seq.append(seq.reshape(window, 1))

        ind = indicators[end - 1]
        # pad or trim indicators
        if ind.shape[0] < n_indicators:
            ind = np.pad(ind, (0, n_indicators - ind.shape[0]))
        else:
            ind = ind[:n_indicators]
        X_ind.append(ind)

        # target: direction in next 5 seconds
        future_price = prices[end + 5]
        current_price = prices[end - 1]
        delta = (future_price - current_price) / (current_price + 1e-8)
        y_reg.append(delta)
        # classify: 0 sell, 1 hold, 2 buy with balanced thresholds
        # Adjusted thresholds to create more balanced classes
        if delta > 0.002:  # 0.2% gain -> BUY
            y_cls.append(2)
        elif delta < -0.002:  # 0.2% loss -> SELL
            y_cls.append(0)
        else:  # Between -0.2% and +0.2% -> HOLD
            y_cls.append(1)

    X_seq = np.array(X_seq)
    X_ind = np.array(X_ind)
    y_cls = np.array(y_cls)
    y_reg = np.array(y_reg)
    return (X_seq, X_ind), (y_cls, y_reg)
