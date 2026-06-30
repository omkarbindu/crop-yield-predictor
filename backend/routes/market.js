const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Minimum Support Prices (₹/quintal) — 2024-25 reference values
const MSP = {
  Wheat: 2275,
  Rice: 2300,
  Maize: 2225,
  Sorghum: 3371,
  Soybeans: 4892,
  Cotton: 7121,
  Bajra: 2625,
  Gram: 5440,
  Tur: 7550,
  Groundnut: 6783
};

// Curated mandi price data. price = current modal price (₹/quintal),
// trend = last 6 months modal price, markets = nearby APMC markets.
const PRICES = {
  Wheat: {
    unit: '₹/quintal',
    trend: [2180, 2210, 2240, 2260, 2300, 2345],
    markets: [
      { market: 'Indore, MP', min: 2280, modal: 2345, max: 2410 },
      { market: 'Karnal, HR', min: 2300, modal: 2360, max: 2420 },
      { market: 'Kota, RJ', min: 2250, modal: 2320, max: 2390 }
    ]
  },
  Rice: {
    unit: '₹/quintal',
    trend: [2950, 3000, 3080, 3120, 3160, 3210],
    markets: [
      { market: 'Karnal, HR', min: 3150, modal: 3210, max: 3320 },
      { market: 'Raipur, CG', min: 3050, modal: 3120, max: 3200 },
      { market: 'Burdwan, WB', min: 3100, modal: 3180, max: 3260 }
    ]
  },
  Maize: {
    unit: '₹/quintal',
    trend: [1820, 1860, 1900, 1920, 1950, 1985],
    markets: [
      { market: 'Nashik, MH', min: 1920, modal: 1985, max: 2050 },
      { market: 'Davangere, KA', min: 1900, modal: 1960, max: 2020 },
      { market: 'Nizamabad, TS', min: 1880, modal: 1940, max: 2000 }
    ]
  },
  Sorghum: {
    unit: '₹/quintal',
    trend: [2600, 2680, 2720, 2780, 2840, 2900],
    markets: [
      { market: 'Solapur, MH', min: 2820, modal: 2900, max: 3000 },
      { market: 'Hubli, KA', min: 2780, modal: 2860, max: 2950 }
    ]
  },
  Soybeans: {
    unit: '₹/quintal',
    trend: [3900, 3980, 4050, 4120, 4180, 4250],
    markets: [
      { market: 'Latur, MH', min: 4150, modal: 4250, max: 4380 },
      { market: 'Indore, MP', min: 4100, modal: 4200, max: 4320 },
      { market: 'Akola, MH', min: 4120, modal: 4220, max: 4350 }
    ]
  },
  Cotton: {
    unit: '₹/quintal',
    trend: [6800, 6900, 7000, 7050, 7100, 7200],
    markets: [
      { market: 'Rajkot, GJ', min: 7050, modal: 7200, max: 7350 },
      { market: 'Adilabad, TS', min: 6950, modal: 7100, max: 7250 }
    ]
  },
  Onion: {
    unit: '₹/quintal',
    trend: [1500, 1800, 2100, 1900, 2200, 2450],
    markets: [
      { market: 'Lasalgaon, MH', min: 2300, modal: 2450, max: 2700 },
      { market: 'Pimpalgaon, MH', min: 2250, modal: 2400, max: 2650 }
    ]
  },
  Potatoes: {
    unit: '₹/quintal',
    trend: [1100, 1200, 1250, 1300, 1280, 1350],
    markets: [
      { market: 'Agra, UP', min: 1280, modal: 1350, max: 1450 },
      { market: 'Hooghly, WB', min: 1250, modal: 1320, max: 1420 }
    ]
  }
};

router.get('/prices', auth, (req, res) => {
  try {
    const { crop } = req.query;
    if (crop && PRICES[crop]) {
      return res.json({
        crop,
        msp: MSP[crop] || null,
        ...PRICES[crop]
      });
    }
    const all = Object.keys(PRICES).map((c) => {
      const modalPrices = PRICES[c].markets.map((m) => m.modal);
      const avgModal = Math.round(modalPrices.reduce((a, b) => a + b, 0) / modalPrices.length);
      const trend = PRICES[c].trend;
      const changePct = trend.length > 1
        ? Math.round(((trend[trend.length - 1] - trend[trend.length - 2]) / trend[trend.length - 2]) * 1000) / 10
        : 0;
      return {
        crop: c,
        unit: PRICES[c].unit,
        avgModal,
        msp: MSP[c] || null,
        changePct,
        trend
      };
    });
    res.json({ crops: all });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load prices.' });
  }
});

router.get('/msp', auth, (req, res) => {
  res.json({
    unit: '₹/quintal',
    season: '2024-25',
    prices: Object.keys(MSP).map((crop) => ({ crop, msp: MSP[crop] }))
  });
});

module.exports = router;
