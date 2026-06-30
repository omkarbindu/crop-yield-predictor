import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import './Features.css';

export default function MandiPrices() {
  const { t, lang } = useLanguage();
  const [prices, setPrices] = useState([]);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [calc, setCalc] = useState({
    crop: 'Wheat',
    yieldQuintals: 100,
    pricePerQuintal: '',
    seedCost: 8000,
    fertilizerCost: 12000,
    laborCost: 15000,
    pesticideCost: 5000,
    otherCost: 5000
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/mandi/prices');
        setPrices(data.prices);
        setDate(data.date);
        const wheat = data.prices.find((p) => p.crop === 'Wheat');
        if (wheat) setCalc((c) => ({ ...c, pricePerQuintal: wheat.currentPrice }));
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onCropChange = (crop) => {
    const p = prices.find((x) => x.crop === crop);
    setCalc((c) => ({ ...c, crop, pricePerQuintal: p ? p.currentPrice : c.pricePerQuintal }));
  };

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const totalCost =
    Number(calc.seedCost) + Number(calc.fertilizerCost) + Number(calc.laborCost) +
    Number(calc.pesticideCost) + Number(calc.otherCost);
  const revenue = Number(calc.yieldQuintals) * Number(calc.pricePerQuintal || 0);
  const profit = revenue - totalCost;
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

  return (
    <div className="feature-page">
      <div className="feature-header glass">
        <span className="feature-badge">{t('mandiBadge')}</span>
        <h1>{t('mandiTitle')}</h1>
        <p>{t('mandiSubtitle')} {date && `· ${date}`}</p>
      </div>

      {error && <p className="feature-error glass">{error}</p>}

      {loading ? (
        <p className="feature-loading">{t('loading')}</p>
      ) : (
        <div className="feature-grid" style={{ marginBottom: 24 }}>
          {prices.map((p) => {
            const max = Math.max(...p.trend);
            const dir = p.changePct > 1 ? 'up' : p.changePct < -1 ? 'down' : 'flat';
            return (
              <div key={p.crop} className="mandi-card glass">
                <div className="mandi-card-top">
                  <div>
                    <div className="mandi-crop">{p.crop}</div>
                    <div className="mandi-price">{fmt(p.currentPrice)}</div>
                    <div className="mandi-unit">{p.unit}</div>
                  </div>
                  <span className={`mandi-change ${dir}`}>
                    {p.changePct > 0 ? '▲' : p.changePct < 0 ? '▼' : '■'} {Math.abs(p.changePct)}%
                  </span>
                </div>
                <div className="mandi-spark">
                  {p.trend.map((v, i) => (
                    <div
                      key={i}
                      className="mandi-spark-bar"
                      style={{ height: `${Math.max(12, (v / max) * 100)}%` }}
                      title={fmt(v)}
                    />
                  ))}
                </div>
                <div className="mandi-msp">
                  <span>{t('mandiMsp')}: {fmt(p.msp)}</span>
                  <span className={p.aboveMsp ? 'ok' : 'below'}>
                    {p.aboveMsp ? t('mandiAboveMsp') : t('mandiBelowMsp')}
                  </span>
                </div>
                <div className="mandi-signal">{lang === 'hi' ? p.signal_hi : p.signal}</div>
                <div className="mandi-best">
                  🏆 {t('mandiBestMarket')}: <strong>{p.bestMarket}</strong> — {fmt(p.bestMarketPrice)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="tool-card glass">
        <h2>{t('profitTitle')}</h2>
        <div className="tool-layout">
          <div className="tool-form">
            <label>{t('crop')}</label>
            <select className="input-field" value={calc.crop} onChange={(e) => onCropChange(e.target.value)}>
              {prices.map((p) => <option key={p.crop} value={p.crop}>{p.crop}</option>)}
            </select>
            <label>{t('profitYield')} (quintals)</label>
            <input type="number" className="input-field" value={calc.yieldQuintals}
              onChange={(e) => setCalc((c) => ({ ...c, yieldQuintals: e.target.value }))} />
            <label>{t('mandiPrice')} (₹/quintal)</label>
            <input type="number" className="input-field" value={calc.pricePerQuintal}
              onChange={(e) => setCalc((c) => ({ ...c, pricePerQuintal: e.target.value }))} />
            <label>{t('profitSeed')}</label>
            <input type="number" className="input-field" value={calc.seedCost}
              onChange={(e) => setCalc((c) => ({ ...c, seedCost: e.target.value }))} />
            <label>{t('profitFertilizer')}</label>
            <input type="number" className="input-field" value={calc.fertilizerCost}
              onChange={(e) => setCalc((c) => ({ ...c, fertilizerCost: e.target.value }))} />
            <label>{t('profitLabor')}</label>
            <input type="number" className="input-field" value={calc.laborCost}
              onChange={(e) => setCalc((c) => ({ ...c, laborCost: e.target.value }))} />
            <label>{t('profitPesticide')}</label>
            <input type="number" className="input-field" value={calc.pesticideCost}
              onChange={(e) => setCalc((c) => ({ ...c, pesticideCost: e.target.value }))} />
            <label>{t('profitOther')}</label>
            <input type="number" className="input-field" value={calc.otherCost}
              onChange={(e) => setCalc((c) => ({ ...c, otherCost: e.target.value }))} />
          </div>
          <div>
            <div className="tool-result">
              <h3>{t('profitResult')}</h3>
              <div className="tool-result-row"><span>{t('profitRevenue')}</span><strong>{fmt(revenue)}</strong></div>
              <div className="tool-result-row"><span>{t('profitTotalCost')}</span><strong>{fmt(totalCost)}</strong></div>
              <div className="tool-result-row">
                <span>{t('profitNet')}</span>
                <strong style={{ color: profit >= 0 ? '#2e7d32' : '#c62828' }}>{fmt(profit)}</strong>
              </div>
              <div className="tool-result-row">
                <span>{t('profitMargin')}</span>
                <strong style={{ color: margin >= 0 ? '#2e7d32' : '#c62828' }}>{margin}%</strong>
              </div>
              <p className="tool-tip">
                {profit >= 0 ? t('profitTipGood') : t('profitTipLoss')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
