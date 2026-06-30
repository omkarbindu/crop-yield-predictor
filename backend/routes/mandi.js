const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// MSP (Minimum Support Price) 2024-25 in Rs/quintal (approximate official values)
const MSP = {
  Wheat: 2275,
  Rice: 2300,
  Maize: 2225,
  Sorghum: 3371,
  Soybeans: 4892,
  Cotton: 7121,
  Groundnut: 6783,
  Bajra: 2625,
  Gram: 5440,
  Mustard: 5650
};

const MARKETS = [
  'Indore, MP', 'Karnal, HR', 'Nashik, MH', 'Ludhiana, PB',
  'Ahmedabad, GJ', 'Jaipur, RJ', 'Kanpur, UP', 'Nagpur, MH'
];

// Deterministic pseudo-random based on string + index, so prices are stable per day
function seededValue(seed, idx) {
  let h = 0;
  const s = seed + ':' + idx;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return (h % 1000) / 1000; // 0..1
}

function buildTrend(base, seed) {
  // 6-month trend ending near current price
  const trend = [];
  let val = base * 0.9;
  for (let i = 0; i < 6; i++) {
    const delta = (seededValue(seed, i) - 0.45) * base * 0.08;
    val = Math.max(base * 0.75, val + delta + base * 0.02);
    trend.push(Math.round(val));
  }
  return trend;
}

function signalFromTrend(trend, msp, current) {
  const first = trend[0];
  const last = trend[trend.length - 1];
  const changePct = ((last - first) / first) * 100;
  let signal, signal_hi;
  if (changePct > 4) {
    signal = 'Prices are rising. Good time to sell or hold a little longer for peak.';
    signal_hi = 'कीमतें बढ़ रही हैं। बेचने या थोड़ा रुकने का अच्छा समय है।';
  } else if (changePct < -4) {
    signal = 'Prices are falling. Consider selling soon or storing for recovery.';
    signal_hi = 'कीमतें गिर रही हैं। जल्दी बेचने या भंडारण पर विचार करें।';
  } else {
    signal = 'Prices are stable. Sell as per your cash flow needs.';
    signal_hi = 'कीमतें स्थिर हैं। अपनी जरूरत के अनुसार बेचें।';
  }
  return { changePct: Math.round(changePct * 10) / 10, signal, signal_hi, aboveMsp: current >= msp };
}

router.get('/prices', auth, (req, res) => {
  try {
    const crops = Object.keys(MSP);
    const today = new Date().toISOString().slice(0, 10);
    const data = crops.map((crop) => {
      const msp = MSP[crop];
      const trend = buildTrend(msp, crop + today);
      const current = trend[trend.length - 1];
      const bestMarketIdx = Math.floor(seededValue(crop + today, 99) * MARKETS.length);
      const bestMarketPrice = Math.round(current * (1 + seededValue(crop, 7) * 0.06));
      return {
        crop,
        msp,
        currentPrice: current,
        unit: '₹/quintal',
        trend,
        bestMarket: MARKETS[bestMarketIdx],
        bestMarketPrice,
        ...signalFromTrend(trend, msp, current)
      };
    });
    res.json({ date: today, prices: data });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load mandi prices.' });
  }
});

module.exports = router;
