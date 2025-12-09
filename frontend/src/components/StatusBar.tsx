import React, { useState, useEffect } from 'react';
import './StatusBar.css';

interface StatusBarProps {
    isConnected: boolean;
    lastUpdate?: Date;
}

const StatusBar: React.FC<StatusBarProps> = ({ isConnected, lastUpdate }) => {
    const [ currentTime, setCurrentTime ] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="status-bar">
            <div className="status-item">
                <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
                <span className="status-text">
                    {isConnected ? 'Connected' : 'Disconnected'}
                </span>
            </div>

            <div className="status-item">
                <span className="status-icon">🕐</span>
                <span className="status-text">{formatTime(currentTime)}</span>
            </div>

            {lastUpdate && (
                <div className="status-item">
                    <span className="status-icon">🔄</span>
                    <span className="status-text">
                        Last update: {formatTime(lastUpdate)}
                    </span>
                </div>
            )}

            <div className="status-item">
                <span className="status-icon">⚡</span>
                <span className="status-text">HFT Mode</span>
            </div>
        </div>
    );
};

export default StatusBar;
