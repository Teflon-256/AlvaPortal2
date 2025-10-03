import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/bybit', async (req, res) => {
  try {
    const { method = 'GET', endpoint, headers = {}, body } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    const bybitUrl = `https://api.bybit.com${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(bybitUrl, options);
    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy request failed', 
      message: error.message 
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bybit proxy server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
