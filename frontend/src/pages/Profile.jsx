import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import MapPicker from '../components/MapPicker';
import './Profile.css';

export default function Profile() {
  const { farmer } = useAuth();
  const { t } = useLanguage();

  const loc = farmer?.location;
  const gis = farmer?.gisData;
  const hasGis = gis && (gis.latitude != null || gis.longitude != null);

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { dateStyle: 'medium' });
  };

  return (
    <div className="profile-page">
      <div className="profile-header glass">
        <h1>{t('profileTitle')}</h1>
        <p className="profile-subtitle">{t('profileSubtitle')}</p>
      </div>

      <div className="profile-card glass">
        <h2>{t('myProfile')}</h2>
        <dl className="profile-dl">
          <dt>{t('name')}</dt>
          <dd>{farmer?.name ?? '—'}</dd>
          <dt>{t('email')}</dt>
          <dd>{farmer?.email ?? '—'}</dd>
          <dt>{t('phone')}</dt>
          <dd>{farmer?.phone ?? '—'}</dd>
          <dt>{t('memberSince')}</dt>
          <dd>{formatDate(farmer?.createdAt)}</dd>
        </dl>
      </div>

      <div className="profile-card glass">
        <h2>{t('farmLocation')}</h2>
        {loc?.coordinates?.length === 2 ? (
          <>
            <dl className="profile-dl">
              <dt>{t('coordinates')}</dt>
              <dd>{loc.coordinates[1].toFixed(6)}, {loc.coordinates[0].toFixed(6)} (lat, lng)</dd>
              {loc.address && (
                <>
                  <dt>{t('address')}</dt>
                  <dd>{loc.address}</dd>
                </>
              )}
            </dl>
            <div className="profile-map">
              <MapPicker value={loc} onChange={() => {}} height={280} readOnly />
            </div>
          </>
        ) : (
          <p className="profile-empty">{t('pickPin')}</p>
        )}
      </div>

      <div className="profile-card glass">
        <h2>{t('gisDataTitle')}</h2>
        <p className="profile-gis-subtitle">{t('gisDataSubtitle')}</p>
        {hasGis ? (
          <dl className="profile-dl">
            {gis.latitude != null && (
              <>
                <dt>{t('latitude')}</dt>
                <dd>{Number(gis.latitude).toFixed(6)}</dd>
              </>
            )}
            {gis.longitude != null && (
              <>
                <dt>{t('longitude')}</dt>
                <dd>{Number(gis.longitude).toFixed(6)}</dd>
              </>
            )}
            {gis.accuracy != null && (
              <>
                <dt>{t('accuracy')}</dt>
                <dd>{gis.accuracy} m</dd>
              </>
            )}
            {gis.altitude != null && (
              <>
                <dt>{t('altitude')}</dt>
                <dd>{gis.altitude} m</dd>
              </>
            )}
            {gis.altitudeAccuracy != null && (
              <>
                <dt>{t('altitudeAccuracy')}</dt>
                <dd>{gis.altitudeAccuracy} m</dd>
              </>
            )}
            {gis.heading != null && (
              <>
                <dt>{t('heading')}</dt>
                <dd>{gis.heading}°</dd>
              </>
            )}
            {gis.speed != null && (
              <>
                <dt>{t('speed')}</dt>
                <dd>{gis.speed} m/s</dd>
              </>
            )}
            {gis.timestamp && (
              <>
                <dt>{t('capturedAt')}</dt>
                <dd>{formatDate(gis.timestamp)}</dd>
              </>
            )}
          </dl>
        ) : (
          <p className="profile-empty">{t('noGisData')}</p>
        )}
      </div>
    </div>
  );
}
