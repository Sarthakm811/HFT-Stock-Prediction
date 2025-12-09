import React, { useState, useEffect } from 'react';
import './MarketDepth.css';

interface MarketDepthProps {
    symbol: string;
}

const MarketDepth: React.FC<MarketDepthProps> = ({ symbol }) => {
    const [ bids, setBids ] = useState<any[]>([]);
    const [ asks, setAsks ] = useState<any[]>([]);

    useEffect(() => {
        generateMarketDepth();
        const interval = setInterval(generateMarketDepth, 3000);
        return () => clearInterval(interval);
    }, [ symbol ]);

    const generateMarketDepth = () => {
        const basePrice = 2450;
        const newBids = [];
        const newAsks = [];

        for (let i = 0; i < 5; i++) {
            newBids.push({
                price: (basePrice - i * 0.5).toFixed(2),
                quantity: Math.floor(Math.random() * 1000) + 100,
                orders: Math.floor(Math.random() * 10) + 1
            });

            newAsks.push({
                price: (basePrice + i * 0.5).toFixed(2),
                quantity: Math.floor(Math.random() * 1000) + 100,
                orders: Math.floor(Math.random() * 10) + 1
            });
        }

        setBids(newBids);
        setAsks(newAsks);
    };

    return (
        <div className="market-depth">
            <h4>📊 Market Depth - {symbol}</h4>
            <div className="depth-container">
                <div className="bids-section">
                    <div className="depth-header">
                        <span>Price</span>
                        <span>Qty</span>
                        <span>Orders</span>
                    </div>
                    {bids.map((bid, idx) => (
                        <div key={idx} className="depth-row bid-row">
                            <span className="price">{bid.price}</span>
                            <span className="quantity">{bid.quantity}</span>
                            <span className="orders">{bid.orders}</span>
                            <div
                                className="depth-bar bid-bar"
                                style={{ width: `${(bid.quantity / 1000) * 100}%` }}
                            />
                        </div>
                    ))}
                </div>

                <div className="spread-indicator">
                    <span className="spread-label">Spread</span>
                    <span className="spread-value">
                        ₹{(parseFloat(asks[ 0 ]?.price || 0) - parseFloat(bids[ 0 ]?.price || 0)).toFixed(2)}
                    </span>
                </div>

                <div className="asks-section">
                    <div className="depth-header">
                        <span>Price</span>
                        <span>Qty</span>
                        <span>Orders</span>
                    </div>
                    {asks.map((ask, idx) => (
                        <div key={idx} className="depth-row ask-row">
                            <span className="price">{ask.price}</span>
                            <span className="quantity">{ask.quantity}</span>
                            <span className="orders">{ask.orders}</span>
                            <div
                                className="depth-bar ask-bar"
                                style={{ width: `${(ask.quantity / 1000) * 100}%` }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MarketDepth;
