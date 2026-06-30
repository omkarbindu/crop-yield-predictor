import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import ShetimitraChat from '../components/ShetimitraChat';
import './Features.css';
import './Shetimitra.css';

export default function Shetimitra() {
  const { t } = useLanguage();

  return (
    <div className="feature-page shetimitra-page">
      <header className="feature-header glass">
        <span className="feature-badge">{t('shetimitraName')}</span>
        <h1>🌾 {t('shetimitraName')}</h1>
        <p>{t('shetimitraTagline')}</p>
      </header>

      <div className="shetimitra-page-card glass">
        <ShetimitraChat />
      </div>

      <p className="shetimitra-page-hint">
        {t('shetimitraTagline')} — <Link to="/">{t('home')}</Link>
      </p>
    </div>
  );
}
