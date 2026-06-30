import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import './Features.css';

const CROPS = ['all', 'Wheat', 'Rice', 'Maize', 'Sorghum', 'Soybeans', 'Cotton'];

export default function Schemes() {
  const { t, lang } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [landAcres, setLandAcres] = useState('');
  const [crop, setCrop] = useState('all');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (landAcres) params.landAcres = landAcres;
      if (crop !== 'all') params.crop = crop;
      const { data } = await api.get('/api/schemes/list', { params });
      setSchemes(data.schemes);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const eligibleCount = schemes.filter((s) => s.eligible).length;

  return (
    <div className="feature-page">
      <div className="feature-header glass">
        <span className="feature-badge">{t('schemesBadge')}</span>
        <h1>{t('schemesTitle')}</h1>
        <p>{t('schemesSubtitle')}</p>
      </div>

      <div className="community-new glass">
        <div className="tool-form" style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>{t('schemesLand')}</label>
            <input type="number" className="input-field" placeholder="e.g. 3"
              value={landAcres} onChange={(e) => setLandAcres(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>{t('crop')}</label>
            <select className="input-field" value={crop} onChange={(e) => setCrop(e.target.value)}>
              {CROPS.map((c) => <option key={c} value={c}>{c === 'all' ? t('mandiAll') : c}</option>)}
            </select>
          </div>
          <button type="button" className="btn-primary" onClick={load}>{t('schemesFind')}</button>
        </div>
      </div>

      {error && <p className="feature-error glass">{error}</p>}

      {!loading && (
        <p style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>
          {t('schemesEligibleCount')}: <strong>{eligibleCount}</strong> / {schemes.length}
        </p>
      )}

      {loading ? (
        <p className="feature-loading">{t('loading')}</p>
      ) : (
        <div className="feature-grid">
          {schemes.map((s) => (
            <div key={s.id} className={`scheme-card glass ${s.eligible ? '' : 'ineligible'}`}>
              <div className="scheme-top">
                <div className="scheme-name">{lang === 'hi' ? s.name_hi : s.name}</div>
                <span className="scheme-cat">{s.category}</span>
              </div>
              <span className={`scheme-eligible-tag ${s.eligible ? 'yes' : 'no'}`}>
                {s.eligible ? `✓ ${t('schemesEligible')}` : `${t('schemesCheck')}`}
              </span>
              <p className="scheme-benefit">{lang === 'hi' ? s.benefit_hi : s.benefit}</p>
              {!s.eligible && s.ineligibleReason && (
                <p className="scheme-docs">ℹ️ {s.ineligibleReason}</p>
              )}
              <p className="scheme-docs">📄 {t('schemesDocs')}: {s.docs.join(', ')}</p>
              <a className="scheme-link" href={s.link} target="_blank" rel="noreferrer">
                {t('schemesApply')} →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
