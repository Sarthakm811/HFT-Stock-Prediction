/**
 * HFT Trading System - Node.js Backend
 * Proxies requests to Python FastAPI backend
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const PYTHON_API = process.env.PYTHON_API || 'http://localhost:8001';

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : [ 'http://localhost:3000', 'http://localhost:3001' ];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'HFT Trading System API',
        version: '1.0.0',
        environment: NODE_ENV,
        endpoints: {
            health: '/api/health',
            stats: '/api/stats',
            predict: '/api/predict',
            history: '/api/history/:symbol',
            symbols: '/api/symbols',
            ensemble: '/api/ensemble/info',
            backtest: '/api/backtest/results'
        }
    });
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API}/health`);
        res.json({
            status: 'ok',
            backend: 'online',
            environment: NODE_ENV,
            timestamp: new Date().toISOString(),
            python_api: response.data
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            backend: 'online',
            environment: NODE_ENV,
            timestamp: new Date().toISOString(),
            python_api: 'offline',
            message: 'Python API not responding'
        });
    }
});

// Get system stats
app.get('/api/stats', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API}/stats`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get historical data for a symbol
app.get('/api/history/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const { points = 100 } = req.query;

        // Read from processed data
        const dataPath = path.join(__dirname, '../../processed/combined_1s.csv');

        if (!fs.existsSync(dataPath)) {
            return res.status(404).json({ error: 'Data file not found' });
        }

        // Read CSV file
        const csvData = fs.readFileSync(dataPath, 'utf-8');
        const lines = csvData.split('\n');
        const headers = lines[ 0 ].split(',');

        // Find symbol column index
        const symbolIndex = headers.indexOf('symbol');
        const datetimeIndex = headers.indexOf('datetime');
        const priceIndex = headers.indexOf('price');
        const volumeIndex = headers.indexOf('volume');

        // Filter data for symbol
        const symbolData = [];
        for (let i = 1; i < lines.length; i++) {
            const row = lines[ i ].split(',');
            if (row[ symbolIndex ] === symbol) {
                symbolData.push({
                    datetime: row[ datetimeIndex ],
                    price: parseFloat(row[ priceIndex ]),
                    volume: parseFloat(row[ volumeIndex ] || 0)
                });
            }
        }

        // Get last N points
        const lastPoints = symbolData.slice(-parseInt(points));

        res.json({
            symbol,
            data: lastPoints,
            total_points: symbolData.length
        });

    } catch (error) {
        console.error('Error reading history:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get prediction
app.post('/api/predict', async (req, res) => {
    try {
        const { symbol, window_seconds } = req.body;

        if (!symbol) {
            return res.status(400).json({ error: 'Symbol is required' });
        }

        const response = await axios.post(`${PYTHON_API}/predict`, {
            symbol,
            window_seconds: window_seconds || 128
        });

        res.json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Get ensemble info
app.get('/api/ensemble/info', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API}/ensemble/info`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get available symbols
app.get('/api/symbols', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API}/symbols`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get backtest results
app.get('/api/backtest/results', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API}/backtest/results`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Batch predictions
app.post('/api/predict/batch', async (req, res) => {
    try {
        const { symbols } = req.body;

        if (!symbols || !Array.isArray(symbols)) {
            return res.status(400).json({ error: 'Symbols array is required' });
        }

        const predictions = await Promise.all(
            symbols.map(async (symbol) => {
                try {
                    const response = await axios.post(`${PYTHON_API}/predict`, { symbol });
                    return response.data;
                } catch (error) {
                    return { symbol, error: error.message };
                }
            })
        );

        res.json({ predictions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 HFT Trading Backend Server');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Server running on: http://localhost:${PORT}`);
    console.log(`✅ Python API: ${PYTHON_API}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('Available endpoints:');
    console.log('  GET  /api/health');
    console.log('  GET  /api/stats');
    console.log('  GET  /api/history/:symbol');
    console.log('  POST /api/predict');
    console.log('  POST /api/predict/batch');
    console.log('  GET  /api/ensemble/info');
    console.log('  GET  /api/symbols');
    console.log('  GET  /api/backtest/results');
    console.log('═══════════════════════════════════════════════════════');
});
