const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Recommended nutrient uptake kg per acre (N, P, K) by crop
const CROP_NPK = {
  Wheat: { n: 48, p: 24, k: 16 },
  Rice: { n: 40, p: 20, k: 20 },
  Maize: { n: 48, p: 24, k: 24 },
  Sorghum: { n: 32, p: 16, k: 16 },
  Soybeans: { n: 12, p: 32, k: 20 },
  Cotton: { n: 40, p: 20, k: 20 },
  Potatoes: { n: 60, p: 40, k: 50 }
};

// Soil multipliers — poorer soils need more, rich need less
const SOIL_FACTOR = {
  sandy: 1.2,
  loamy: 1.0,
  clay: 0.9,
  black: 0.85,
  red: 1.1,
  alluvial: 0.95
};

router.post('/fertilizer', auth, (req, res) => {
  try {
    const { crop, soilType, areaAcres } = req.body;
    const base = CROP_NPK[crop] || CROP_NPK.Wheat;
    const factor = SOIL_FACTOR[(soilType || 'loamy').toLowerCase()] || 1.0;
    const area = Number(areaAcres) > 0 ? Number(areaAcres) : 1;

    const n = Math.round(base.n * factor * area);
    const p = Math.round(base.p * factor * area);
    const k = Math.round(base.k * factor * area);

    // Convert to common fertilizer bags (Urea 46% N, DAP 46% P + 18% N, MOP 60% K)
    const dapKg = Math.round(p / 0.46);
    const nFromDap = dapKg * 0.18;
    const ureaKg = Math.round(Math.max(0, n - nFromDap) / 0.46);
    const mopKg = Math.round(k / 0.60);

    res.json({
      crop: crop || 'Wheat',
      soilType: soilType || 'loamy',
      areaAcres: area,
      nutrients: { n, p, k },
      fertilizers: {
        urea_kg: ureaKg,
        dap_kg: dapKg,
        mop_kg: mopKg
      },
      tip: 'Apply DAP & MOP at sowing as basal dose. Split Urea: half at sowing, half at active growth/tillering stage.',
      tip_hi: 'बुवाई के समय DAP और MOP बेसल डोज़ के रूप में दें। यूरिया को बांटें: आधा बुवाई पर, आधा सक्रिय वृद्धि अवस्था पर।'
    });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Fertilizer advice failed.' });
  }
});

router.post('/irrigation', auth, (req, res) => {
  try {
    const { crop, stage, recentRainMm, avgTempC } = req.body;
    const rain = Number(recentRainMm) || 0;
    const temp = Number(avgTempC) || 28;

    // Base water need (mm/week) by stage
    const stageNeed = {
      sowing: 25,
      vegetative: 40,
      flowering: 55,
      maturity: 30
    };
    let need = stageNeed[(stage || 'vegetative').toLowerCase()] || 40;
    if (temp > 35) need += 10;
    else if (temp < 20) need -= 8;

    const deficit = Math.max(0, need - rain);
    let advice, advice_hi;
    if (deficit <= 5) {
      advice = 'Soil moisture is likely sufficient. Skip irrigation this week and recheck in 3-4 days.';
      advice_hi = 'मिट्टी में पर्याप्त नमी है। इस सप्ताह सिंचाई न करें, 3-4 दिन बाद जांचें।';
    } else if (deficit <= 25) {
      advice = `Apply a light irrigation of about ${deficit} mm (roughly ${(deficit / 25).toFixed(1)} hours of drip).`;
      advice_hi = `लगभग ${deficit} मिमी हल्की सिंचाई करें (करीब ${(deficit / 25).toFixed(1)} घंटे ड्रिप)।`;
    } else {
      advice = `Crop needs significant water (~${deficit} mm). Irrigate fully, preferably early morning or evening to reduce loss.`;
      advice_hi = `फसल को अधिक पानी चाहिए (~${deficit} मिमी)। सुबह जल्दी या शाम को पूरी सिंचाई करें।`;
    }

    res.json({
      crop: crop || 'Wheat',
      stage: stage || 'vegetative',
      weeklyNeedMm: need,
      recentRainMm: rain,
      deficitMm: deficit,
      advice,
      advice_hi
    });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Irrigation advice failed.' });
  }
});

module.exports = router;
