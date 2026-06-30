import { useState, useEffect } from 'react';

const key = (import.meta.env.VITE_GOOGLE_MAP_KEY || '').trim();

if (import.meta.env.DEV) {
  console.debug(
    '[useGoogleMap] VITE_GOOGLE_MAP_KEY:',
    key ? `set (${key.length} chars)` : 'missing — create frontend/.env (not .env.example)'
  );
}

export function useGoogleMap() {
  const [loaded, setLoaded] = useState(!!window.google?.maps);

  useEffect(() => {
    if (window.google?.maps) {
      setLoaded(true);
      return;
    }
    if (!key) {
      setLoaded(false);
      return;
    }
    const id = 'google-maps-script';
    if (document.getElementById(id)) {
      const check = setInterval(() => {
        if (window.google?.maps) {
          setLoaded(true);
          clearInterval(check);
        }
      }, 200);
      return () => clearInterval(check);
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
    return () => {};
  }, []);

  return { loaded, key };
}
