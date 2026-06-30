import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";
import "./Predictor.css";

export default function DiseasePredictor() {
  const { t, lang } = useLanguage();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [predData, setPredData] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setExplanation(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      let { data: pred } = await api.post("/api/disease/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      pred = pred.data;
      const pestLabels = (pred.pest_detections || [])
        .map((d) => d.label)
        .join(", ");

      const diseaseLabels = (pred.disease_detections || [])
        .map((d) => d.label)
        .join(", ");

      const summary = `
Pest detected: ${pred.pest_detected ? "Yes" : "No"}
${pestLabels ? "Pests: " + pestLabels : ""}

Disease detected: ${pred.disease_detected ? "Yes" : "No"}
${diseaseLabels ? "Diseases: " + diseaseLabels : ""}
`;
      setResult(summary);
      setPredData(pred);
      const { data: expl } = await api.post("/api/gemini/explain-disease", {
        diseaseResult: summary,
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
        <h1>{t("diseaseTitle")}</h1>
        <p>{t("diseaseSubtitle")}</p>
        <p className="predictor-hint">{t("supportedCrops")}</p>
      </div>

      <div className="predictor-card glass">
        <form onSubmit={handleSubmit} className="predictor-form">
          <label>{t("uploadImage")}</label>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="input-file"
          />
          {preview && (
            <div className="disease-preview">
              <img src={preview} alt="Upload" />
            </div>
          )}
          {error && <p className="predictor-error">{error}</p>}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !file}
          >
            {loading ? t("loading") : t("predict")}
          </button>
        </form>
      </div>

      {result && (
        <>
          <div className="predictor-card glass">
            <h2>{t("diagnosis")}</h2>
            <pre className="predictor-result-json">{result}</pre>
          </div>

          {(predData?.pest_detected || predData?.disease_detected) && (
            <div className="predictor-card glass">
              <h2>{t("treatmentTitle")}</h2>
              <ul className="treatment-list">
                <li>
                  <strong>1. {t("treatStep1")}</strong>
                  <p>{t("treatStep1Desc")}</p>
                </li>
                <li>
                  <strong>2. {t("treatStep2")}</strong>
                  <p>
                    {predData?.disease_detected ? t("treatDisease") : t("treatPest")}
                  </p>
                </li>
                <li>
                  <strong>3. {t("treatStep3")}</strong>
                  <p>{t("treatStep3Desc")}</p>
                </li>
                <li>
                  <strong>4. {t("treatStep4")}</strong>
                  <p>{t("treatStep4Desc")}</p>
                </li>
              </ul>
              <p className="treatment-warn">⚠️ {t("treatWarn")}</p>
            </div>
          )}
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
