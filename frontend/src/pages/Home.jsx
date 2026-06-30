import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import MapPicker from '../components/MapPicker';
import './Home.css';

export default function Home() {
  const { farmer, updateFarmer, fetchMe } = useAuth();
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [editLocation, setEditLocation] = useState(farmer?.location || null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [satellite, setSatellite] = useState(false);

  const currentLocation = editing ? editLocation : farmer?.location;

  const handleSaveLocation = async () => {
    if (!editLocation?.coordinates) return;
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await api.patch('/api/farmer/location', { location: editLocation });
      updateFarmer(data.farmer);
      setEditing(false);
      setMessage({ type: 'success', text: t('locationSaved') });
      fetchMe();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || t('error') });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    setEditLocation(farmer?.location ? { ...farmer.location } : null);
    setEditing(true);
  };

  return (
    <div className="home-page">
      <div className="home-header glass">
        <h1>{t('yourFarm')}</h1>
        <p className="home-welcome">
          {farmer?.name}, {t('tagline')}
        </p>
      </div>

      <div className="home-map-section glass">
        <div className="home-map-header">
          <h2>{t('location')}</h2>
          <div className="home-map-actions">
            <label className="home-satellite">
              <input
                type="checkbox"
                checked={satellite}
                onChange={(e) => setSatellite(e.target.checked)}
              />
              <span>{t('satellite')}</span>
            </label>
            {!editing ? (
              <button type="button" className="btn-primary" onClick={startEdit}>
                {t('editLocation')}
              </button>
            ) : (
              <>
                <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveLocation}
                  disabled={saving || !editLocation?.coordinates}
                >
                  {saving ? t('saving') : t('saveLocation')}
                </button>
              </>
            )}
          </div>
        </div>
        {editing ? (
          <MapPicker
            value={editLocation}
            onChange={setEditLocation}
            height={380}
            satellite={satellite}
          />
        ) : (
          <div className="home-map-display">
            <MapPicker
              value={currentLocation}
              onChange={() => {}}
              height={380}
              satellite={satellite}
              readOnly
            />
            {!currentLocation?.coordinates && (
              <p className="home-no-location">
                {t('pickPin')} <button type="button" className="btn-primary" onClick={startEdit}>{t('editLocation')}</button>
              </p>
            )}
          </div>
        )}
        {message && (
          <p className={message.type === 'success' ? 'home-msg success' : 'home-msg error'}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
