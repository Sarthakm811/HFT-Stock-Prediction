import React from 'react';
import './ConfidenceGauge.css';

interface ConfidenceGaugeProps {
    confidence: number;
    action: string;
}

const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({ confidence, action }) => {
    const getColor = () => {
        if (confidence >= 90) return '#10b981';
        if (confidence >= 75) return '#f59e0b';
        return '#ef4444';
    };

    const getRotation = () => {
        return (confidence / 100) * 180 - 90;
    };

    return (
        <div className="confidence-gauge">
            <h4>🎯 Confidence Level</h4>
            <div className="gauge-container">
                <svg viewBox="0 0 200 120" className="gauge-svg">
                    {/* Background arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="20"
                        strokeLinecap="round"
                    />
                    {/* Colored arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke={getColor()}
                        strokeWidth="20"
                        strokeLinecap="round"
                        strokeDasharray={`${(confidence / 100) * 251.2} 251.2`}
                    />
                    {/* Needle */}
                    <line
                        x1="100"
                        y1="100"
                        x2="100"
                        y2="30"
                        stroke="#333"
                        strokeWidth="3"
                        strokeLinecap="round"
                        transform={`rotate(${getRotation()} 100 100)`}
                    />
                    {/* Center dot */}
                    <circle cx="100" cy="100" r="8" fill="#333" />
                </svg>
                <div className="gauge-value">
                    <span className="confidence-number">{confidence.toFixed(1)}%</span>
                    <span className="action-label">{action}</span>
                </div>
            </div>
            <div className="gauge-labels">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
            </div>
        </div>
    );
};

export default ConfidenceGauge;
