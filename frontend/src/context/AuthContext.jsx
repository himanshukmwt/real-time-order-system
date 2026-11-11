import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const isAuthenticated = !!user;

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data.user);
      } catch {
        localStorage.removeItem('accessToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { accessToken, user: loggedInUser } = data.data;

    localStorage.setItem('accessToken', accessToken);
    setUser(loggedInUser);

    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors — we clear local state regardless
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated, login, register, logout }),
    [user, loading, isAuthenticated, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
