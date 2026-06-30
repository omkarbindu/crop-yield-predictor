import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useGoogleMap } from '../hooks/useGoogleMap';
import './MapPicker.css';

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

export default function MapPicker({ value, onChange, height = 320, satellite = false, readOnly = false }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const { loaded, key } = useGoogleMap();
  const { t } = useLanguage();
  const [error, setError] = useState(null);

  const coords = value?.coordinates ? { lat: value.coordinates[1], lng: value.coordinates[0] } : null;

  useEffect(() => {
    if (!loaded || !key || !containerRef.current || !window.google?.maps) return;

    const center = coords || DEFAULT_CENTER;
    const map = new window.google.maps.Map(containerRef.current, {
      center,
      zoom: coords ? 14 : 5,
      mapTypeId: satellite ? 'hybrid' : 'roadmap',
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
      ]
    });
    mapRef.current = map;

    const marker = new window.google.maps.Marker({
      position: center,
      map,
      draggable: !readOnly,
      title: 'Farm location'
    });
    markerRef.current = marker;

    const update = (position) => {
      if (readOnly || !onChange) return;
      const lat = position.lat();
      const lng = position.lng();
      onChange({
        coordinates: [lng, lat],
        address: '',
        placeId: ''
      });
    };

    if (!readOnly) {
      map.addListener('click', (e) => {
        marker.setPosition(e.latLng);
        update(e.latLng);
      });
      marker.addListener('dragend', () => update(marker.getPosition()));
    }

    return () => {
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [loaded, key, satellite, readOnly]);

  useEffect(() => {
    if (coords && markerRef.current) {
      markerRef.current.setPosition(coords);
      mapRef.current?.panTo(coords);
    }
  }, [coords?.lat, coords?.lng]);

  const requestGeolocation = () => {
    if (readOnly) return;
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onChange({
          coordinates: [lng, lat],
          address: '',
          placeId: ''
        });
        if (markerRef.current) markerRef.current.setPosition({ lat, lng });
        if (mapRef.current) {
          mapRef.current.setCenter({ lat, lng });
          mapRef.current.setZoom(14);
        }
      },
      () => setError(t('permissionDenied'))
    );
  };

  if (!key) {
    return (
      <div className="map-picker map-picker-placeholder" style={{ height }}>
        <p>
          Add <code>VITE_GOOGLE_MAP_KEY</code> to <code>frontend/.env</code> (same folder as{' '}
          <code>package.json</code>). Vite does not load <code>.env.example</code>.
        </p>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="map-picker map-picker-placeholder" style={{ height }}>
        <p>{t('loading')} map...</p>
      </div>
    );
  }

  return (
    <div className="map-picker">
      <div ref={containerRef} className="map-container" style={{ height }} />
      {!readOnly && (
        <>
          <div className="map-picker-actions">
            <button type="button" className="btn-primary" onClick={requestGeolocation}>
              {t('getLocation')}
            </button>
          </div>
          {error && <p className="map-picker-error">{error}</p>}
          <p className="map-picker-hint">{t('pickPin')}</p>
        </>
      )}
    </div>
  );
}
