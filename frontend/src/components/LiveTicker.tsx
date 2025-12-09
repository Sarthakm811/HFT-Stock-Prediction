import React, { useState, useEffect } from 'react';
import './LiveTicker.css';

const SYMBOLS = [ 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'WIPRO', 'AXISBANK' ];

const LiveTicker: React.FC = () => {
    const [ tickers, setTickers ] = useState<any[]>([]);

    useEffect(() => {
        generateTickers();
        const interval = setInterval(updateTickers, 2000);
        return () => clearInterval(interval);
    }, []);

    const generateTickers = () => {
        const newTickers = SYMBOLS.map(symbol => ({
            symbol,
            price: (2000 + Math.random() * 1000).toFixed(2),
            change: (Math.random() * 4 - 2).toFixed(2),
            changePercent: (Math.random() * 2 - 1).toFixed(2),
            volume: Math.floor(Math.random() * 1000000)
        }));
        setTickers(newTickers);
    };

    const updateTickers = () => {
        setTickers(prev => prev.map(ticker => ({
            ...ticker,
            price: (parseFloat(ticker.price) + (Math.random() * 2 - 1)).toFixed(2),
            change: (Math.random() * 4 - 2).toFixed(2),
            changePercent: (Math.random() * 2 - 1).toFixed(2)
        })));
    };

    return (
        <div className="live-ticker">
            <div className="ticker-header">
                <span className="ticker-icon">📊</span>
                <span className="ticker-title">Live Market</span>
            </div>
            <div className="ticker-scroll">
                {tickers.map((ticker, idx) => (
                    <div key={idx} className="ticker-item">
                        <span className="ticker-symbol">{ticker.symbol}</span>
                        <span className="ticker-price">₹{ticker.price}</span>
                        <span className={`ticker-change ${parseFloat(ticker.change) >= 0 ? 'positive' : 'negative'}`}>
                            {parseFloat(ticker.change) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(ticker.change)).toFixed(2)} ({ticker.changePercent}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveTicker;
