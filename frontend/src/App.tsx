import React, { useState, useEffect } from 'react';
import './App.css';
import './styles/dark-mode.css';
import './styles/enhanced.css';
import Dashboard from './components/Dashboard';
import AnimatedBackground from './components/AnimatedBackground';
import PremiumLoader from './components/PremiumLoader';
import NotificationSystem from './components/NotificationSystem';
import StatusBar from './components/StatusBar';
import PredictionPanel from './components/PredictionPanel';
import StatsPanel from './components/StatsPanel';
import VolumeChart from './components/VolumeChart';
import ConfidenceGauge from './components/ConfidenceGauge';
import MarketDepth from './components/MarketDepth';
import LiveTicker from './components/LiveTicker';
import HistoricalChart from './components/HistoricalChart';
import ThemeToggle from './components/ThemeToggle';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import { SystemStats, PredictionResult } from './types';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [ stats, setStats ] = useState<SystemStats | null>(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState<string | null>(null);
  const [ selectedSymbol, setSelectedSymbol ] = useState('RELIANCE');
  const [ predictionData, setPredictionData ] = useState<any>(null);
  const [ isDarkMode, setIsDarkMode ] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [ notifications, setNotifications ] = useState<any[]>([]);
  const [ lastUpdate, setLastUpdate ] = useState<Date>(new Date());

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Apply dark mode class
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [ isDarkMode ]);

  useEffect(() => {
    // Listen for prediction updates
    const handlePredictionUpdate = (event: any) => {
      setPredictionData(event.detail);
      setSelectedSymbol(event.detail.symbol);
    };

    window.addEventListener('predictionUpdate', handlePredictionUpdate);
    return () => window.removeEventListener('predictionUpdate', handlePredictionUpdate);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    addNotification({
      type: isDarkMode ? 'info' : 'info',
      title: 'Theme Changed',
      message: `Switched to ${isDarkMode ? 'light' : 'dark'} mode`,
      duration: 3000
    });
  };

  const addNotification = (notification: any) => {
    const id = Date.now().toString();
    setNotifications(prev => [ ...prev, { ...notification, id } ]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <AnimatedBackground />
      <NotificationSystem notifications={notifications} onRemove={removeNotification} />
      <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />
      <KeyboardShortcuts onRefresh={fetchStats} onToggleTheme={toggleTheme} />

      <header className="App-header">
        <h1>🚀 HFT Trading System</h1>
        <p>High-Frequency Trading with 95% Confidence AI</p>
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ {error} - Make sure backend is running on port 5000
        </div>
      )}

      <main className="App-main">
        {loading ? (
          <PremiumLoader message="Loading system data..." />
        ) : (
          <>
            <LiveTicker />
            <Dashboard stats={stats} />

            <div className="trading-section">
              <div className="left-panel">
                {/* Candlestick chart temporarily disabled - will fix library compatibility */}
                <HistoricalChart
                  symbol={selectedSymbol}
                  apiBase={API_BASE}
                  predictionData={predictionData}
                />
                <VolumeChart symbol={selectedSymbol} />
              </div>
              <div className="right-panel">
                <PredictionPanel apiBase={API_BASE} />
                {predictionData && (
                  <ConfidenceGauge
                    confidence={predictionData.confidence}
                    action={predictionData.action}
                  />
                )}
              </div>
            </div>

            <div className="bottom-section">
              <MarketDepth symbol="RELIANCE" />
              <StatsPanel stats={stats} />
            </div>
          </>
        )}
      </main>

      <footer className="App-footer">
        <p>© 2025 HFT Trading System | Powered by LSTM + CNN Ensemble</p>
      </footer>

      <StatusBar isConnected={!error} lastUpdate={lastUpdate} />
    </div>
  );
}

export default App;
