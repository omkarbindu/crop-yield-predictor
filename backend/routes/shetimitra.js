const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const auth = require("../middleware/auth");
const router = express.Router();

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SYSTEM_PROMPT_BASE = `You are Shetimitra, a friendly agricultural AI assistant for Indian farmers using the Crop Yield Predictor app.

Your expertise covers: farming practices, crop selection, weather, mandi prices, government schemes, crop diseases, yield improvement, farm equipment, and general agricultural advice.

You know about these app features and can guide farmers to use them:
- Yield Predictor: predict crop yield based on region, rainfall, temperature, pesticides
- Crop Disease Predictor: upload leaf/crop images for disease detection
- Weather Analysis: farm-specific weather forecast
- Mandi Prices: daily market rates, MSP comparison, best-time-to-sell signals
- Government Scheme Finder: subsidies, insurance, loans (PM-KISAN, PMFBY, etc.)
- Grain Direct marketplace: zero-commission farm-to-customer grain sales
- Equipment Rental: rent tractors, harvesters from nearby farmers
- Crop Advisory: fertilizer and irrigation recommendations
- Farmer Community: ask questions and share tips with other farmers

Guidelines:
- Be concise, practical, and farmer-friendly. Avoid jargon; explain simply.
- Give actionable advice. Mention relevant app features when helpful.
- For medical/legal/financial specifics, give general guidance and suggest consulting local Krishi Vigyan Kendra or agriculture officer.
- Do not make up real-time mandi prices or weather — suggest checking the app's Mandi Prices or Weather pages for live data.`;

function buildSystemPrompt(lang) {
  const languageRule =
    lang === "hi"
      ? `LANGUAGE (mandatory): The farmer selected Hindi in the app. Reply ONLY in Hindi using Devanagari script. Do not use English in your reply.`
      : `LANGUAGE (mandatory): The farmer selected English in the app. Reply ONLY in English. Do not use Hindi or Devanagari in your reply.`;

  return `${SYSTEM_PROMPT_BASE}\n\n${languageRule}`;
}

/** Gemini chat history must start with role "user", not "model". */
function normalizeGeminiHistory(history, currentMessage) {
  const turns = (Array.isArray(history) ? history : [])
    .filter(
      (h) =>
        h &&
        typeof h.content === "string" &&
        h.content.trim() &&
        (h.role === "user" || h.role === "assistant" || h.role === "model"),
    )
    .map((h) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content.trim() }],
    }));

  // Remove leading model turns (welcome bubbles, etc.)
  while (turns.length > 0 && turns[0].role === "model") {
    turns.shift();
  }

  // Fix consecutive same-role entries (keep the latest)
  const cleaned = [];
  for (const turn of turns) {
    const last = cleaned[cleaned.length - 1];
    if (last && last.role === turn.role) {
      cleaned[cleaned.length - 1] = turn;
    } else {
      cleaned.push(turn);
    }
  }

  // Current user message is sent via sendMessage — don't duplicate in history
  const msg = String(currentMessage || "").trim();
  if (
    cleaned.length > 0 &&
    cleaned[cleaned.length - 1].role === "user" &&
    cleaned[cleaned.length - 1].parts[0].text === msg
  ) {
    cleaned.pop();
  }

  return cleaned.slice(-10);
}

async function sendChatWithRetry(model, history, message, retries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(message);
      return result.response?.text?.() || "";
    } catch (error) {
      lastError = error;
      const retryable = /fetch failed|ECONNRESET|ETIMEDOUT|socket hang up|429|503/i.test(
        error.message || "",
      );
      if (attempt < retries && retryable) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

router.post("/chat", auth, async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({ error: "Gemini API key not configured." });
    }

    const { message, history, lang } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "message is required." });
    }

    const trimmed = message.trim();
    const chatHistory = normalizeGeminiHistory(history, trimmed);
    const appLang = lang === "hi" ? "hi" : "en";

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: buildSystemPrompt(appLang),
    });

    const text = await sendChatWithRetry(model, chatHistory, trimmed);
    const reply =
      text.trim() ||
      "Sorry, I could not generate a response. Please try again.";

    res.json({ reply });
  } catch (e) {
    console.error("Shetimitra chat error:", e.message);
    res.status(500).json({
      error: e.message || "Shetimitra is temporarily unavailable. Please try again.",
    });
  }
});

module.exports = router;
