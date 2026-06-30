import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        <h1>{t('appName')}</h1>
        <p className="auth-tagline">{t('tagline')}</p>
        <h2>{t('login')}</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            className="input-field"
            placeholder={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? t('loading') : t('login')}
          </button>
        </form>
        <p className="auth-switch">
          {t('noAccount')} <Link to="/register">{t('register')}</Link>
        </p>
      </div>
    </div>
  );
}
