import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import MapPicker from '../components/MapPicker';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState(null);
  const [gisData, setGisData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const requestGis = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGisData({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude ?? null,
          altitudeAccuracy: pos.coords.altitudeAccuracy ?? null,
          heading: pos.coords.heading ?? null,
          speed: pos.coords.speed ?? null
        });
        if (!location) {
          setLocation({
            coordinates: [pos.coords.longitude, pos.coords.latitude],
            address: '',
            placeId: ''
          });
        }
      },
      () => {}
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        location: location || undefined,
        gisData: gisData || undefined
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass auth-card-wide">
        <h1>{t('appName')}</h1>
        <p className="auth-tagline">{t('tagline')}</p>
        <h2>{t('register')}</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            className="input-field"
            placeholder={t('name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            className="input-field"
            placeholder={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="tel"
            className="input-field"
            placeholder={t('phone')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            type="password"
            className="input-field"
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className="auth-label">{t('location')}</label>
          <p className="auth-hint">{t('pickOnMap')}</p>
          <MapPicker value={location} onChange={setLocation} />
          <div className="auth-gis">
            <label className="auth-check">
              <input type="checkbox" onChange={(e) => e.target.checked && requestGis()} />
              <span>{t('allowGis')}</span>
            </label>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? t('loading') : t('submit')}
          </button>
        </form>
        <p className="auth-switch">
          {t('hasAccount')} <Link to="/login">{t('login')}</Link>
        </p>
      </div>
    </div>
  );
}
