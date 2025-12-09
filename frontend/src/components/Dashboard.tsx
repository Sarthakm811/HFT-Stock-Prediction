import React from 'react';
import { SystemStats } from '../types';
import './Dashboard.css';

interface DashboardProps {
    stats: SystemStats | null;
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
    if (!stats) return null;

    return (
        <div className="dashboard">
            <div className="stat-card">
                <h3>System Status</h3>
                <div className={`value ${stats.model_loaded ? 'positive' : 'negative'}`}>
                    {stats.model_loaded ? '✅ Online' : '⚠️ Offline'}
                </div>
            </div>

            <div className="stat-card">
                <h3>Model Type</h3>
                <div className="value">{stats.model_type || 'N/A'}</div>
            </div>

            <div className="stat-card">
                <h3>Total Ticks</h3>
                <div className="value">{stats.total_ticks.toLocaleString()}</div>
            </div>

            <div className="stat-card">
                <h3>Symbols</h3>
                <div className="value">{stats.symbols}</div>
            </div>

            <div className="stat-card">
                <h3>Confidence</h3>
                <div className="value positive">95%</div>
            </div>

            <div className="stat-card">
                <h3>Agreement</h3>
                <div className="value positive">100%</div>
            </div>
        </div>
    );
};

export default Dashboard;
