import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [farmer, setFarmer] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('crop-token'));
  const [loading, setLoading] = useState(!!token);

  const fetchMe = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get('/api/auth/me');
      setFarmer(data.farmer);
    } catch {
      setToken(null);
      setFarmer(null);
      localStorage.removeItem('crop-token');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('crop-token', data.token);
    setToken(data.token);
    setFarmer(data.farmer);
    return data;
  }, []);

  const register = useCallback(async (body) => {
    const { data } = await api.post('/api/auth/register', body);
    localStorage.setItem('crop-token', data.token);
    setToken(data.token);
    setFarmer(data.farmer);
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setFarmer(null);
    localStorage.removeItem('crop-token');
  }, []);

  const updateFarmer = useCallback((updated) => {
    setFarmer((p) => (p ? { ...p, ...updated } : null));
  }, []);

  return (
    <AuthContext.Provider value={{ farmer, token, loading, login, register, logout, updateFarmer, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
