import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ShetimitraChat from './ShetimitraChat';
import '../pages/Shetimitra.css';

export default function ShetimitraWidget() {
  const { farmer } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (!farmer) return null;

  if (location.pathname === '/shetimitra') return null;

  return (
    <div className="shetimitra-widget">
      {open && (
        <div className="shetimitra-panel glass" role="dialog" aria-label={t('shetimitraName')}>
          <div className="shetimitra-panel-header">
            <div className="shetimitra-panel-title">
              <span className="shetimitra-panel-icon" aria-hidden="true">🌾</span>
              <div>
                <strong>{t('shetimitraName')}</strong>
                <span>{t('shetimitraTagline')}</span>
              </div>
            </div>
            <div className="shetimitra-panel-actions">
              <Link
                to="/shetimitra"
                className="shetimitra-panel-expand"
                title={t('shetimitraName')}
                onClick={() => setOpen(false)}
              >
                ⛶
              </Link>
              <button
                type="button"
                className="shetimitra-panel-close"
                onClick={() => setOpen(false)}
                aria-label={t('shetimitraClose')}
              >
                ✕
              </button>
            </div>
          </div>
          <ShetimitraChat compact />
        </div>
      )}

      <button
        type="button"
        className="shetimitra-fab"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? t('shetimitraClose') : t('shetimitraOpenChat')}
      >
        {open ? '✕' : '🌾'}
      </button>
    </div>
  );
}
