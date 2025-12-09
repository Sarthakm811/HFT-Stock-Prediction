import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './TradingChart.css';

interface TradingChartProps {
    symbol: string;
}

const TradingChart: React.FC<TradingChartProps> = ({ symbol }) => {
    const [ data, setData ] = useState<any[]>([]);
    const [ timeframe, setTimeframe ] = useState('1m');

    useEffect(() => {
        generateMockData();
    }, [ symbol, timeframe ]);

    const generateMockData = () => {
        const points = 50;
        const basePrice = 2450;
        const mockData = [];

        for (let i = 0; i < points; i++) {
            const time = new Date(Date.now() - (points - i) * 60000);
            const price = basePrice + Math.random() * 50 - 25;
            const volume = Math.floor(Math.random() * 10000) + 5000;

            mockData.push({
                time: time.toLocaleTimeString(),
                price: price.toFixed(2),
                volume: volume,
                high: (price + Math.random() * 5).toFixed(2),
                low: (price - Math.random() * 5).toFixed(2),
            });
        }

        setData(mockData);
    };

    return (
        <div className="trading-chart">
            <div className="chart-header">
                <h3>📈 {symbol} - Live Price Chart</h3>
                <div className="timeframe-selector">
                    {[ '1m', '5m', '15m', '1h' ].map(tf => (
                        <button
                            key={tf}
                            className={timeframe === tf ? 'active' : ''}
                            onClick={() => setTimeframe(tf)}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="time"
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                        domain={[ 'auto', 'auto' ]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#667eea"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                    />
                </AreaChart>
            </ResponsiveContainer>

            <div className="chart-footer">
                <div className="price-info">
                    <span className="label">Current:</span>
                    <span className="value">₹{data[ data.length - 1 ]?.price || '0.00'}</span>
                </div>
                <div className="price-info">
                    <span className="label">High:</span>
                    <span className="value positive">₹{Math.max(...data.map(d => parseFloat(d.high))).toFixed(2)}</span>
                </div>
                <div className="price-info">
                    <span className="label">Low:</span>
                    <span className="value negative">₹{Math.min(...data.map(d => parseFloat(d.low))).toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default TradingChart;
