import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './VolumeChart.css';

interface VolumeChartProps {
    symbol: string;
}

const VolumeChart: React.FC<VolumeChartProps> = ({ symbol }) => {
    const [ data, setData ] = useState<any[]>([]);

    useEffect(() => {
        generateVolumeData();
    }, [ symbol ]);

    const generateVolumeData = () => {
        const points = 20;
        const mockData = [];

        for (let i = 0; i < points; i++) {
            const time = new Date(Date.now() - (points - i) * 60000);
            const volume = Math.floor(Math.random() * 50000) + 10000;
            const change = Math.random() > 0.5 ? 'up' : 'down';

            mockData.push({
                time: time.toLocaleTimeString(),
                volume: volume,
                fill: change === 'up' ? '#10b981' : '#ef4444'
            });
        }

        setData(mockData);
    };

    return (
        <div className="volume-chart">
            <h4>📊 Volume Analysis</h4>
            <ResponsiveContainer width="100%" height={150}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="time"
                        stroke="#666"
                        tick={{ fontSize: 10 }}
                    />
                    <YAxis
                        stroke="#666"
                        tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                        }}
                    />
                    <Bar dataKey="volume" fill="#667eea" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default VolumeChart;
