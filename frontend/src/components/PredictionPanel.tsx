import React, { useState } from 'react';
import { PredictionResult } from '../types';
import './PredictionPanel.css';

interface PredictionPanelProps {
    apiBase: string;
}

const POPULAR_SYMBOLS = [ 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'WIPRO', 'AXISBANK' ];

const PredictionPanel: React.FC<PredictionPanelProps> = ({ apiBase }) => {
    const [ symbol, setSymbol ] = useState('RELIANCE');
    const [ prediction, setPrediction ] = useState<PredictionResult | null>(null);
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const getPrediction = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${apiBase}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol })
            });

            if (!response.ok) throw new Error('Prediction failed');

            const data = await response.json();
            setPrediction(data);

            // Emit event for other components
            window.dispatchEvent(new CustomEvent('predictionUpdate', { detail: data }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'BUY': return '#10b981';
            case 'SELL': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    return (
        <div className="prediction-panel">
            <h2>📊 Get Prediction</h2>

            <div className="input-group">
                <label>Select Symbol:</label>
                <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                    {POPULAR_SYMBOLS.map(sym => (
                        <option key={sym} value={sym}>{sym}</option>
                    ))}
                </select>
            </div>

            <button
                onClick={getPrediction}
                disabled={loading}
                className="predict-button"
            >
                {loading ? '⏳ Predicting...' : '🔮 Get Prediction'}
            </button>

            {error && <div className="error">{error}</div>}

            {prediction && (
                <div className="prediction-result">
                    <div className="result-header">
                        <h3>{prediction.symbol}</h3>
                        <div
                            className="action-badge"
                            style={{ backgroundColor: getActionColor(prediction.action) }}
                        >
                            {prediction.action}
                        </div>
                    </div>

                    <div className="result-stats">
                        <div className="result-stat">
                            <span className="label">Confidence:</span>
                            <span className="value">{prediction.confidence.toFixed(1)}%</span>
                        </div>
                        <div className="result-stat">
                            <span className="label">Delta:</span>
                            <span className="value">{prediction.delta > 0 ? '+' : ''}{prediction.delta.toFixed(4)}</span>
                        </div>
                        <div className="result-stat">
                            <span className="label">Agreement:</span>
                            <span className="value">{prediction.agreement_rate.toFixed(0)}%</span>
                        </div>
                    </div>

                    <div className="ensemble-details">
                        <h4>Ensemble Details:</h4>
                        <div className="detail-row">
                            <span>Bagging:</span>
                            <span>{prediction.details.bagging}</span>
                        </div>
                        <div className="detail-row">
                            <span>Boosting:</span>
                            <span>{prediction.details.boosting}</span>
                        </div>
                        <div className="detail-row">
                            <span>Stacking:</span>
                            <span>{prediction.details.stacking}</span>
                        </div>
                        <div className="detail-row">
                            <span>Price:</span>
                            <span>₹{prediction.details.price.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictionPanel;
