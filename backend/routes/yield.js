const express = require("express");
const axios = require("axios");
const auth = require("../middleware/auth");
const router = express.Router();

const PYTHON_YIELD_URL =
  process.env.PYTHON_YIELD_URL ||
  "http://localhost:5000/v1/predict/yield-production";

router.post("/predict", auth, async (req, res) => {
  try {
    console.log("[NODE] Incoming yield request:", req.body);
    const {
      Area,
      Item,
      average_rain_fall_mm_per_year,
      pesticides_tonnes,
      avg_temp,
    } = req.body;
    if (
      !Area ||
      !Item ||
      average_rain_fall_mm_per_year == null ||
      pesticides_tonnes == null ||
      avg_temp == null
    ) {
      return res.status(400).json({
        error:
          "Required: Area, Item, average_rain_fall_mm_per_year, pesticides_tonnes, avg_temp",
      });
    }
    const payload = {
      Area: String(Area),
      Item: String(Item),
      average_rain_fall_mm_per_year: Number(average_rain_fall_mm_per_year),
      pesticides_tonnes: Number(pesticides_tonnes),
      avg_temp: Number(avg_temp),
    };
    console.log("[NODE] Calling Python URL:", PYTHON_YIELD_URL);
    const { data } = await axios.post(PYTHON_YIELD_URL, payload, {
      timeout: 120000,
      headers: { "Content-Type": "application/json" },
    });
    console.log("[NODE] Python response:", data);
    res.json(data);
  } catch (e) {
    const status = e.response?.status || 500;
    const py = e.response?.data;
    const msg =
      py?.msg ||
      (typeof py?.detail === "string" ? py.detail : null) ||
      py?.message ||
      py?.error ||
      e.message;
    console.error("[NODE] Python proxy error:", status, py || e.message);
    res.status(status).json({ error: msg || "Yield prediction failed." });
  }
});

module.exports = router;
