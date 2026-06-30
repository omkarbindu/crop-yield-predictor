import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import './Weather.css';

export default function Weather() {
  const { t, lang } = useLanguage();
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [curRes, foreRes] = await Promise.all([
          api.get('/api/weather/current'),
          api.get('/api/weather/forecast')
        ]);
        if (!cancelled) {
          setCurrent(curRes.data);
          setForecast(foreRes.data);
        }
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.error || e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="page-center">{t('loading')}...</div>;
  if (error) return <div className="weather-page"><div className="glass card-error">{error}</div></div>;

  const cur = current?.current;
  const loc = current?.location || forecast?.location;
  const days = forecast?.forecast?.forecastday || [];

  return (
    <div className="weather-page">
      <div className="weather-header glass">
        <h1>{t('weatherTitle')}</h1>
        <p>{t('weatherSubtitle')}</p>
        {loc && (
          <p className="weather-loc">{loc.name}, {loc.region} ({loc.country})</p>
        )}
      </div>

      {cur && (
        <div className="weather-card glass">
          <h2>{t('current')}</h2>
          <div className="weather-current-grid">
            <div className="weather-main">
              <span className="weather-temp">{cur.temp_c}°C</span>
              <span className="weather-condition">{cur.condition?.text}</span>
              <span className="weather-feels">{t('feelsLike')}: {cur.feelslike_c}°C</span>
            </div>
            <div className="weather-details">
              <p><strong>{t('humidity')}</strong>: {cur.humidity}%</p>
              <p><strong>{t('wind')}</strong>: {cur.wind_kph} km/h {cur.wind_dir}</p>
              {cur.precip_mm != null && <p><strong>{t('rain')}</strong>: {cur.precip_mm} mm</p>}
            </div>
          </div>
        </div>
      )}

      <div className="weather-card glass">
        <h2>{t('forecast')} — {t('month')} (14 {lang === 'hi' ? 'दिन' : 'days'})</h2>
        <div className="forecast-grid">
          {days.slice(0, 14).map((d) => (
            <div key={d.date} className="forecast-day glass-dark">
              <div className="forecast-date">{d.date}</div>
              <div className="forecast-temp">{d.day?.avgtemp_c}°C</div>
              <div className="forecast-condition">{d.day?.condition?.text}</div>
              <div className="forecast-rain">{t('rain')}: {d.day?.totalprecip_mm ?? 0} mm</div>
            </div>
          ))}
        </div>
      </div>

      <div className="weather-card glass">
        <h2>{t('quarter')} / {t('year')}</h2>
        <p className="weather-note">
          {lang === 'hi'
            ? 'मौसम API मुफ्त योजना 14 दिन का पूर्वानुमान देता है। तिमाही और वार्षिक अनुमान के लिए ऊपर के पूर्वानुमान का उपयोग करें और स्थानीय कृषि विस्तार सेवाओं से जुड़ें।'
            : 'Weather API free plan provides 14-day forecast. Use the forecast above for quarter and yearly planning and consult local agriculture extension services for long-range outlook.'}
        </p>
      </div>
    </div>
  );
}
