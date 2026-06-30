import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import './Features.css';

const CROPS = ['Wheat', 'Rice', 'Maize', 'Sorghum', 'Soybeans', 'Cotton', 'Potatoes'];
const SOILS = ['loamy', 'sandy', 'clay', 'black', 'red', 'alluvial'];
const STAGES = ['sowing', 'vegetative', 'flowering', 'maturity'];

export default function Advisory() {
  const { t, lang } = useLanguage();
  const [error, setError] = useState(null);

  const [fert, setFert] = useState({ crop: 'Wheat', soilType: 'loamy', areaAcres: 2 });
  const [fertResult, setFertResult] = useState(null);
  const [fertLoading, setFertLoading] = useState(false);

  const [irr, setIrr] = useState({ crop: 'Wheat', stage: 'vegetative', recentRainMm: 10, avgTempC: 28 });
  const [irrResult, setIrrResult] = useState(null);
  const [irrLoading, setIrrLoading] = useState(false);

  const getFertilizer = async (e) => {
    e.preventDefault();
    setFertLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/advisory/fertilizer', fert);
      setFertResult(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setFertLoading(false);
    }
  };

  const getIrrigation = async (e) => {
    e.preventDefault();
    setIrrLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/advisory/irrigation', irr);
      setIrrResult(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIrrLoading(false);
    }
  };

  return (
    <div className="feature-page">
      <div className="feature-header glass">
        <span className="feature-badge">{t('advisoryBadge')}</span>
        <h1>{t('advisoryTitle')}</h1>
        <p>{t('advisorySubtitle')}</p>
      </div>

      {error && <p className="feature-error glass">{error}</p>}

      <div className="tool-layout">
        <div className="tool-card glass">
          <h2>🌱 {t('fertTitle')}</h2>
          <form className="tool-form" onSubmit={getFertilizer}>
            <label>{t('crop')}</label>
            <select className="input-field" value={fert.crop}
              onChange={(e) => setFert((f) => ({ ...f, crop: e.target.value }))}>
              {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label>{t('fertSoil')}</label>
            <select className="input-field" value={fert.soilType}
              onChange={(e) => setFert((f) => ({ ...f, soilType: e.target.value }))}>
              {SOILS.map((s) => <option key={s} value={s}>{t('soil_' + s)}</option>)}
            </select>
            <label>{t('fertArea')} (acres)</label>
            <input type="number" className="input-field" min="0.1" step="0.1" value={fert.areaAcres}
              onChange={(e) => setFert((f) => ({ ...f, areaAcres: e.target.value }))} />
            <button type="submit" className="btn-primary" disabled={fertLoading}>
              {fertLoading ? t('loading') : t('fertGet')}
            </button>
          </form>
          {fertResult && (
            <div className="tool-result">
              <h3>{t('fertResult')} — {fertResult.areaAcres} {t('fertAcres')}</h3>
              <div className="tool-result-row"><span>Nitrogen (N)</span><strong>{fertResult.nutrients.n} kg</strong></div>
              <div className="tool-result-row"><span>Phosphorus (P)</span><strong>{fertResult.nutrients.p} kg</strong></div>
              <div className="tool-result-row"><span>Potassium (K)</span><strong>{fertResult.nutrients.k} kg</strong></div>
              <div className="tool-result-row"><span>Urea</span><strong>{fertResult.fertilizers.urea_kg} kg</strong></div>
              <div className="tool-result-row"><span>DAP</span><strong>{fertResult.fertilizers.dap_kg} kg</strong></div>
              <div className="tool-result-row"><span>MOP</span><strong>{fertResult.fertilizers.mop_kg} kg</strong></div>
              <p className="tool-tip">💡 {lang === 'hi' ? fertResult.tip_hi : fertResult.tip}</p>
            </div>
          )}
        </div>

        <div className="tool-card glass">
          <h2>💧 {t('irrTitle')}</h2>
          <form className="tool-form" onSubmit={getIrrigation}>
            <label>{t('crop')}</label>
            <select className="input-field" value={irr.crop}
              onChange={(e) => setIrr((f) => ({ ...f, crop: e.target.value }))}>
              {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label>{t('irrStage')}</label>
            <select className="input-field" value={irr.stage}
              onChange={(e) => setIrr((f) => ({ ...f, stage: e.target.value }))}>
              {STAGES.map((s) => <option key={s} value={s}>{t('stage_' + s)}</option>)}
            </select>
            <label>{t('irrRain')} (mm, last week)</label>
            <input type="number" className="input-field" value={irr.recentRainMm}
              onChange={(e) => setIrr((f) => ({ ...f, recentRainMm: e.target.value }))} />
            <label>{t('irrTemp')} (°C)</label>
            <input type="number" className="input-field" value={irr.avgTempC}
              onChange={(e) => setIrr((f) => ({ ...f, avgTempC: e.target.value }))} />
            <button type="submit" className="btn-primary" disabled={irrLoading}>
              {irrLoading ? t('loading') : t('irrGet')}
            </button>
          </form>
          {irrResult && (
            <div className="tool-result">
              <h3>{t('irrResult')}</h3>
              <div className="tool-result-row"><span>{t('irrNeed')}</span><strong>{irrResult.weeklyNeedMm} mm</strong></div>
              <div className="tool-result-row"><span>{t('irrRainHad')}</span><strong>{irrResult.recentRainMm} mm</strong></div>
              <div className="tool-result-row"><span>{t('irrDeficit')}</span><strong>{irrResult.deficitMm} mm</strong></div>
              <p className="tool-tip">💧 {lang === 'hi' ? irrResult.advice_hi : irrResult.advice}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
