import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Alerts.css';
import './Features.css';

const TYPE_ICONS = {
  weather: '🌤️',
  irrigation: '💧',
  mandi: '📈',
  calendar: '📅',
};

export default function Alerts() {
  const { t, lang } = useLanguage();
  const { farmer } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const { data } = await api.get('/api/alerts');
      setAlerts(data.alerts || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await load();
  };

  const markRead = async (id) => {
    await api.patch(`/api/alerts/${id}/read`);
    setAlerts((prev) =>
      prev.map((a) => (a._id === id ? { ...a, read: true } : a)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await api.post('/api/alerts/read-all');
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    setUnreadCount(0);
  };

  const label = (alert) => {
    if (lang === 'hi' && alert.title_hi) return alert.title_hi;
    return alert.title;
  };

  const body = (alert) => {
    if (lang === 'hi' && alert.message_hi) return alert.message_hi;
    return alert.message;
  };

  return (
    <div className="feature-page alerts-page">
      <header className="feature-header glass">
        <span className="feature-badge">{t('alertsNav')}</span>
        <h1>🔔 {t('alertsTitle')}</h1>
        <p>{t('alertsSubtitle')}</p>
        <div className="alerts-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={refresh}
            disabled={refreshing}
          >
            {refreshing ? t('loading') : t('alertsRefresh')}
          </button>
          {unreadCount > 0 && (
            <button type="button" className="btn-secondary" onClick={markAllRead}>
              {t('alertsMarkAllRead')}
            </button>
          )}
        </div>
      </header>

      {!farmer?.location?.coordinates?.length && (
        <p className="alerts-hint glass">
          {t('alertsLocationHint')}{' '}
          <Link to="/">{t('home')}</Link>
        </p>
      )}

      {error && <div className="feature-error glass">{error}</div>}

      {loading ? (
        <div className="feature-loading glass">{t('loading')}</div>
      ) : alerts.length === 0 ? (
        <div className="feature-empty glass">{t('alertsEmpty')}</div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <article
              key={alert._id}
              className={`alert-card glass ${alert.read ? 'read' : 'unread'}`}
              onClick={() => !alert.read && markRead(alert._id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !alert.read) markRead(alert._id);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="alert-card-top">
                <span className="alert-type">
                  {TYPE_ICONS[alert.type] || '🔔'} {t(`alertType_${alert.type}`)}
                </span>
                {!alert.read && <span className="alert-unread-dot" />}
              </div>
              <h3>{label(alert)}</h3>
              <p>{body(alert)}</p>
              <time className="alert-time">
                {new Date(alert.createdAt).toLocaleString()}
              </time>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
