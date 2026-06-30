const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/explain-yield", auth, async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({ error: "Gemini API key not configured." });
    }
    const { input, prediction } = req.body;
    if (!input || !prediction) {
      return res
        .status(400)
        .json({ error: "input and prediction are required." });
    }
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are an agricultural expert. A yield prediction was made with the following input and result.

Input data:
- Area: ${input.Area}
- Crop (Item): ${input.Item}
- Average rainfall (mm/year): ${input.average_rain_fall_mm_per_year}
- Pesticides (tonnes): ${input.pesticides_tonnes}
- Average temperature: ${input.avg_temp}

Prediction result: ${typeof prediction === "object" ? JSON.stringify(prediction) : prediction}

Assume this prediction is correct. Explain in a short, farmer-friendly way:
1) Why this yield outcome makes sense given the inputs.
2) What factors (rainfall, temperature, pesticides, region) influenced it.
3) One or two practical suggestions to improve or maintain yield.

Respond in JSON only, with exactly two keys:
- "explanation_en": full explanation in English (2-4 short paragraphs).
- "explanation_hi": same explanation in Hindi (देवनागरी script).`;
    const result = await model.generateContent(prompt);
    const text = result.response?.text?.() || "";
    let explanation_en = "";
    let explanation_hi = "";
    try {
      const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
      explanation_en = parsed.explanation_en || text;
      explanation_hi = parsed.explanation_hi || "";
    } catch (_) {
      explanation_en = text;
    }
    res.json({ explanation_en, explanation_hi });
  } catch (e) {
    res.status(500).json({ error: e.message || "Gemini explanation failed." });
  }
});

// For disease: assume disease is always correct, explain the logic
router.post("/explain-disease", auth, async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({ error: "Gemini API key not configured." });
    }
    const { diseaseResult } = req.body;
    if (!diseaseResult) {
      return res.status(400).json({ error: "diseaseResult is required." });
    }
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are an agricultural expert. A crop disease was identified from an image. Assume the diagnosis is correct.

Disease result: ${typeof diseaseResult === "object" ? JSON.stringify(diseaseResult) : diseaseResult}

Explain in a farmer-friendly way:
1) What this disease/condition means and how it affects the crop.
2) Causes and what to do next (treatment, prevention).
3) When to consult an expert.

Respond in JSON only with exactly two keys:
- "explanation_en": full explanation in English (2-4 short paragraphs).
- "explanation_hi": same explanation in Hindi (देवनागरी script).`;
    const result = await model.generateContent(prompt);
    const text = result.response?.text?.() || "";
    let explanation_en = "";
    let explanation_hi = "";
    try {
      const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
      explanation_en = parsed.explanation_en || text;
      explanation_hi = parsed.explanation_hi || "";
    } catch (_) {
      explanation_en = text;
    }
    res.json({ explanation_en, explanation_hi });
  } catch (e) {
    res.status(500).json({ error: e.message || "Gemini explanation failed." });
  }
});

module.exports = router;
