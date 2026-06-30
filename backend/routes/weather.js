const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const router = express.Router();

const WEATHER_BASE = 'https://api.weatherapi.com/v1';

// Forecast and other data - pass lat, lon from farmer's location
router.get('/forecast', auth, async (req, res) => {
  try {
    const lat = req.query.lat ?? req.farmer?.location?.coordinates?.[1];
    const lon = req.query.lon ?? req.farmer?.location?.coordinates?.[0];
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Farm location (lat/lon) required.' });
    }
    const key = process.env.WEATHER_API_KEY;
    if (!key) {
      return res.status(500).json({ error: 'Weather API key not configured.' });
    }
    const q = `${lat},${lon}`;
    const days = 14; // free plan allows up to 14 days forecast
    const url = `${WEATHER_BASE}/forecast.json?key=${key}&q=${q}&days=${days}`;
    const { data } = await axios.get(url);
    res.json(data);
  } catch (e) {
    const status = e.response?.status || 500;
    const msg = e.response?.data?.error?.message || e.message;
    res.status(status).json({ error: msg || 'Weather fetch failed.' });
  }
});

// Current weather
router.get('/current', auth, async (req, res) => {
  try {
    const lat = req.query.lat ?? req.farmer?.location?.coordinates?.[1];
    const lon = req.query.lon ?? req.farmer?.location?.coordinates?.[0];
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Farm location (lat/lon) required.' });
    }
    const key = process.env.WEATHER_API_KEY;
    if (!key) {
      return res.status(500).json({ error: 'Weather API key not configured.' });
    }
    const q = `${lat},${lon}`;
    const url = `${WEATHER_BASE}/current.json?key=${key}&q=${q}`;
    const { data } = await axios.get(url);
    res.json(data);
  } catch (e) {
    const status = e.response?.status || 500;
    const msg = e.response?.data?.error?.message || e.message;
    res.status(status).json({ error: msg || 'Weather fetch failed.' });
  }
});

module.exports = router;
