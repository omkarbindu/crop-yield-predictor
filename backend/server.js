require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { corsOptions, allowedOrigins } = require('./config/cors');
const authRoutes = require('./routes/auth');
const farmerRoutes = require('./routes/farmer');
const weatherRoutes = require('./routes/weather');
const yieldRoutes = require('./routes/yield');
const diseaseRoutes = require('./routes/disease');
const geminiRoutes = require('./routes/gemini');
const marketplaceRoutes = require('./routes/marketplace');
const mandiRoutes = require('./routes/mandi');
const schemesRoutes = require('./routes/schemes');
const advisoryRoutes = require('./routes/advisory');
const communityRoutes = require('./routes/community');
const equipmentRoutes = require('./routes/equipment');
const shetimitraRoutes = require('./routes/shetimitra');
const alertsRoutes = require('./routes/alerts');
const fmsRoutes = require('./routes/fms');

async function start() {
  const app = express();

  // CORS must be registered before routes so preflight OPTIONS receives headers.
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));  
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({
      ok: true,
      mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
  });

  const connected = await connectDB();
  if (!connected) {
    console.error('MongoDB connection failed — auth and data routes will not work.');
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }

  console.log('CORS allowed origins:', [...allowedOrigins].join(', '));
  console.log('PYTHON_YIELD_URL =', process.env.PYTHON_YIELD_URL);

  app.use('/api/auth', authRoutes);
  app.use('/api/farmer', farmerRoutes);
  app.use('/api/weather', weatherRoutes);
  app.use('/api/yield', yieldRoutes);
  app.use('/api/disease', diseaseRoutes);
  app.use('/api/gemini', geminiRoutes);
  app.use('/api/marketplace', marketplaceRoutes);
  app.use('/api/mandi', mandiRoutes);
  app.use('/api/schemes', schemesRoutes);
  app.use('/api/advisory', advisoryRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/equipment', equipmentRoutes);
  app.use('/api/shetimitra', shetimitraRoutes);
  app.use('/api/alerts', alertsRoutes);
  app.use('/api/fms', fmsRoutes);

  const PORT = process.env.PORT || 8000;
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the existing service on ${PORT} or set PORT in backend/.env.`);
    } else {
      console.error('Server startup error:', err);
    }
    process.exit(1);
  });
}

start();
