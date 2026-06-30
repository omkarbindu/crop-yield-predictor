import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import './Navbar.css';

export default function Navbar() {
  const { farmer, logout } = useAuth();
  const { t, lang, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  const updateMenuPos = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 10,
      right: window.innerWidth - rect.right,
    });
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!farmer) {
      setUnreadAlerts(0);
      return;
    }
    api
      .get('/api/alerts/count')
      .then(({ data }) => setUnreadAlerts(data.unreadCount || 0))
      .catch(() => setUnreadAlerts(0));
  }, [farmer, location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    updateMenuPos();
    window.addEventListener('resize', updateMenuPos);
    window.addEventListener('scroll', updateMenuPos, true);
    return () => {
      window.removeEventListener('resize', updateMenuPos);
      window.removeEventListener('scroll', updateMenuPos, true);
    };
  }, [menuOpen, updateMenuPos]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  const servicesActive = ['/marketplace', '/mandi', '/schemes', '/advisory', '/equipment', '/community', '/shetimitra', '/fms', '/alerts']
    .includes(location.pathname);

  const dropdownMenu = menuOpen && createPortal(
    <div
      ref={menuRef}
      className="nav-dropdown-menu"
      role="menu"
      style={{ top: menuPos.top, right: menuPos.right }}
    >
      <NavLink to="/marketplace" role="menuitem" onClick={closeMenu}>🌾 {t('grainMarket')}</NavLink>
      <NavLink to="/mandi" role="menuitem" onClick={closeMenu}>📈 {t('mandiNav')}</NavLink>
      <NavLink to="/schemes" role="menuitem" onClick={closeMenu}>🏛️ {t('schemesNav')}</NavLink>
      <NavLink to="/advisory" role="menuitem" onClick={closeMenu}>🌱 {t('advisoryNav')}</NavLink>
      <NavLink to="/equipment" role="menuitem" onClick={closeMenu}>🚜 {t('equipNav')}</NavLink>
      <NavLink to="/community" role="menuitem" onClick={closeMenu}>💬 {t('communityNav')}</NavLink>
      <NavLink to="/fms" role="menuitem" onClick={closeMenu}>🚜 {t('fmsNav')}</NavLink>
      <NavLink to="/alerts" role="menuitem" onClick={closeMenu}>🔔 {t('alertsNav')}</NavLink>
      <NavLink to="/shetimitra" role="menuitem" onClick={closeMenu}>🌾 {t('shetimitraNav')}</NavLink>
    </div>,
    document.body
  );

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon" aria-hidden="true">🌾</span>
            <span>{t('appName')}</span>
          </Link>
          <div className="navbar-right">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t('themeLight') : t('themeDark')}
              title={theme === 'dark' ? t('themeLight') : t('themeDark')}
            >
              <span className="theme-toggle-icon" aria-hidden="true">
                {theme === 'dark' ? '☀️' : '🌙'}
              </span>
            </button>
            <div className="lang-switcher" role="group" aria-label={t('language')}>
              <button
                className={lang === 'en' ? 'active' : ''}
                onClick={() => setLanguage('en')}
                type="button"
                aria-pressed={lang === 'en'}
              >
                {t('english')}
              </button>
              <button
                className={lang === 'hi' ? 'active' : ''}
                onClick={() => setLanguage('hi')}
                type="button"
                aria-pressed={lang === 'hi'}
              >
                {t('hindi')}
              </button>
            </div>
            {farmer ? (
              <>
                <NavLink to="/" end>{t('home')}</NavLink>
                <NavLink to="/weather">{t('weather')}</NavLink>
                <NavLink to="/yield">{t('yieldPredictor')}</NavLink>
                <NavLink to="/disease">{t('diseasePredictor')}</NavLink>
                <NavLink to="/fms">{t('fmsNav')}</NavLink>
                <NavLink to="/alerts" className="nav-alerts-link">
                  🔔
                  {unreadAlerts > 0 && (
                    <span className="nav-alerts-badge">{unreadAlerts > 9 ? '9+' : unreadAlerts}</span>
                  )}
                </NavLink>
                <div className="nav-dropdown">
                  <button
                    ref={btnRef}
                    type="button"
                    className={`nav-dropdown-btn ${servicesActive ? 'active' : ''}`}
                    onClick={() => {
                      updateMenuPos();
                      setMenuOpen((o) => !o);
                    }}
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                  >
                    {t('navServices')} <span aria-hidden="true">▾</span>
                  </button>
                </div>
                <NavLink to="/profile">{t('myProfile')}</NavLink>
                <button type="button" className="btn-logout" onClick={handleLogout}>
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">{t('login')}</NavLink>
                <NavLink to="/register">{t('register')}</NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
      {dropdownMenu}
    </>
  );
}
