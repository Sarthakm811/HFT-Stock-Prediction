import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './HistoricalChart.css';

interface HistoricalChartProps {
    symbol: string;
    apiBase: string;
    predictionData?: any;
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ symbol, apiBase, predictionData }) => {
    const [ data, setData ] = useState<any[]>([]);
    const [ loading, setLoading ] = useState(false);
    const [ chartType, setChartType ] = useState<'area' | 'line'>('area');
    const [ dataPoints, setDataPoints ] = useState(100);

    useEffect(() => {
        if (symbol) {
            fetchHistoricalData();
        }
    }, [ symbol, dataPoints ]);

    const fetchHistoricalData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiBase}/history/${symbol}?points=${dataPoints}`);
            const result = await response.json();

            if (result.data) {
                const formattedData = result.data.map((item: any, index: number) => ({
                    time: new Date(item.datetime).toLocaleTimeString(),
                    price: parseFloat(item.price),
                    volume: item.volume,
                    index: index
                }));

                setData(formattedData);
            }
        } catch (error) {
            console.error('Error fetching historical data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStats = () => {
        if (data.length === 0) return { current: 0, high: 0, low: 0, change: 0, changePercent: 0 };

        const prices = data.map(d => d.price);
        const current = prices[ prices.length - 1 ];
        const previous = prices[ 0 ];
        const high = Math.max(...prices);
        const low = Math.min(...prices);
        const change = current - previous;
        const changePercent = ((change / previous) * 100);

        return { current, high, low, change, changePercent };
    };

    const stats = getStats();

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{payload[ 0 ].payload.time}</p>
                    <p className="price">₹{payload[ 0 ].value.toFixed(2)}</p>
                    {payload[ 0 ].payload.volume && (
                        <p className="volume">Vol: {payload[ 0 ].payload.volume.toLocaleString()}</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="historical-chart">
            <div className="chart-header">
                <div className="header-left">
                    <h3>📈 {symbol} - Historical Price</h3>
                    <div className="price-display">
                        <span className="current-price">₹{stats.current.toFixed(2)}</span>
                        <span className={`price-change ${stats.change >= 0 ? 'positive' : 'negative'}`}>
                            {stats.change >= 0 ? '▲' : '▼'} {Math.abs(stats.change).toFixed(2)} ({stats.changePercent.toFixed(2)}%)
                        </span>
                    </div>
                </div>

                <div className="chart-controls">
                    <div className="chart-type-selector">
                        <button
                            className={chartType === 'area' ? 'active' : ''}
                            onClick={() => setChartType('area')}
                        >
                            Area
                        </button>
                        <button
                            className={chartType === 'line' ? 'active' : ''}
                            onClick={() => setChartType('line')}
                        >
                            Line
                        </button>
                    </div>

                    <select
                        value={dataPoints}
                        onChange={(e) => setDataPoints(parseInt(e.target.value))}
                        className="points-selector"
                    >
                        <option value="50">50 points</option>
                        <option value="100">100 points</option>
                        <option value="200">200 points</option>
                        <option value="500">500 points</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="chart-loading">Loading historical data...</div>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={350}>
                        {chartType === 'area' ? (
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
                                    tick={{ fontSize: 11 }}
                                    interval={Math.floor(data.length / 10)}
                                />
                                <YAxis
                                    stroke="#666"
                                    tick={{ fontSize: 11 }}
                                    domain={[ 'auto', 'auto' ]}
                                    tickFormatter={(value) => `₹${value.toFixed(0)}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#667eea"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorPrice)"
                                    animationDuration={500}
                                />
                            </AreaChart>
                        ) : (
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="time"
                                    stroke="#666"
                                    tick={{ fontSize: 11 }}
                                    interval={Math.floor(data.length / 10)}
                                />
                                <YAxis
                                    stroke="#666"
                                    tick={{ fontSize: 11 }}
                                    domain={[ 'auto', 'auto' ]}
                                    tickFormatter={(value) => `₹${value.toFixed(0)}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#667eea"
                                    strokeWidth={2}
                                    dot={false}
                                    animationDuration={500}
                                />
                            </LineChart>
                        )}
                    </ResponsiveContainer>

                    <div className="chart-stats">
                        <div className="stat-item">
                            <span className="stat-label">High</span>
                            <span className="stat-value positive">₹{stats.high.toFixed(2)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Low</span>
                            <span className="stat-value negative">₹{stats.low.toFixed(2)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Data Points</span>
                            <span className="stat-value">{data.length}</span>
                        </div>
                        {predictionData && (
                            <div className="stat-item prediction-stat">
                                <span className="stat-label">AI Prediction</span>
                                <span className={`stat-value ${predictionData.action.toLowerCase()}`}>
                                    {predictionData.action} ({predictionData.confidence.toFixed(1)}%)
                                </span>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default HistoricalChart;
