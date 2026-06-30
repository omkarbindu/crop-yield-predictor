import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";
import "./Predictor.css";

const CROPS = [
  "Rice, paddy",
  "Wheat",
  "Maize",
  "Potatoes",
  "Sweet potatoes",
  "Soyabeans",
  "Sorghum",
  "Cassava",
  "Yams",
  "Plantains and others",
];

export default function YieldPredictor() {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState({
    Area: "India",
    Item: "Rice, paddy",
    average_rain_fall_mm_per_year: 1200,
    pesticides_tonnes: 300,
    avg_temp: 28,
  });
  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setExplanation(null);
    setLoading(true);
    try {
      const payload = {
        Area: form.Area,
        Item: form.Item,
        average_rain_fall_mm_per_year: Number(
          form.average_rain_fall_mm_per_year,
        ),
        pesticides_tonnes: Number(form.pesticides_tonnes),
        avg_temp: Number(form.avg_temp),
      };
      const { data: pred } = await api.post("/api/yield/predict", payload);
      setResult(pred);
      const { data: expl } = await api.post("/api/gemini/explain-yield", {
        input: payload,
        prediction: `${pred.data} hectograms per hectare (hg/ha)`,
      });
      setExplanation(expl);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="predictor-page">
      <div className="predictor-header glass">
        <h1>{t("yieldTitle")}</h1>
        <p>{t("yieldSubtitle")}</p>
      </div>

      <div className="predictor-card glass">
        <form onSubmit={handleSubmit} className="predictor-form">
          <label>{t("area")}</label>
          <input
            type="text"
            className="input-field"
            value={form.Area}
            onChange={(e) => setForm((f) => ({ ...f, Area: e.target.value }))}
          />
          <label>{t("crop")}</label>
          <select
            className="input-field"
            value={form.Item}
            onChange={(e) => setForm((f) => ({ ...f, Item: e.target.value }))}
          >
            {CROPS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label>{t("avgRainfall")}</label>
          <input
            type="number"
            step="any"
            className="input-field"
            value={form.average_rain_fall_mm_per_year}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                average_rain_fall_mm_per_year: e.target.value,
              }))
            }
          />
          <label>{t("pesticides")}</label>
          <input
            type="number"
            step="any"
            className="input-field"
            value={form.pesticides_tonnes}
            onChange={(e) =>
              setForm((f) => ({ ...f, pesticides_tonnes: e.target.value }))
            }
          />
          <label>{t("avgTemp")}</label>
          <input
            type="number"
            step="any"
            className="input-field"
            value={form.avg_temp}
            onChange={(e) =>
              setForm((f) => ({ ...f, avg_temp: e.target.value }))
            }
          />
          {error && <p className="predictor-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t("loading") : t("predict")}
          </button>
        </form>
      </div>

      {result && (
        <>
          <div className="predictor-card glass">
            <h2>{t("result")}</h2>
            <pre className="predictor-result-json">
              {result.data} hectograms per hectare (hg/ha)
            </pre>
          </div>
          {explanation && (
            <div className="predictor-card glass">
              <h2>{t("explanation")}</h2>
              <div className="explanation-tabs">
                <div className="explanation-block">
                  <h3>{t("explanationEn")}</h3>
                  <div className="explanation-text">
                    {explanation.explanation_en}
                  </div>
                </div>
                <div className="explanation-block">
                  <h3>{t("explanationHi")}</h3>
                  <div className="explanation-text">
                    {explanation.explanation_hi}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
