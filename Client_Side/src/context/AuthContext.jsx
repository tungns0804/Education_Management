import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { requestAuth, requestLogout } from '../config/userRequest';
import { DB_ROLE_MAP, DEFAULT_ROLE } from '../constants/auth.constants';

const AuthContext = createContext(null);

function enrichUser(raw) {
  return {
    ...raw,
    roleKey: DB_ROLE_MAP[raw.role] ?? DEFAULT_ROLE,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // null → not authenticated
  const [loading, setLoading] = useState(true);   // true while verifying session on mount

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await requestAuth();
      setUser(enrichUser(res.metadata));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = useCallback((userData) => {
    setUser(enrichUser(userData));
  }, []);

  const logout = useCallback(async () => {
    try { await requestLogout(); } catch { /* ignore network errors on logout */ }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
