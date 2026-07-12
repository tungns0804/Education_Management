import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { requestAuth, requestLogout } from '../config/userRequest';
import { DB_ROLE_MAP, DEFAULT_ROLE } from '../constants/auth.constants';

const AuthContext = createContext(null);

// Bổ sung roleKey (khóa vai trò frontend) vào object user nhận từ API
function enrichUser(raw) {
  return {
    ...raw,
    roleKey: DB_ROLE_MAP[raw.role] ?? DEFAULT_ROLE,
  };
}

// Provider xác thực: khôi phục phiên khi tải trang, cung cấp user / login / logout
export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);   // null → chưa đăng nhập
  const [loading, setLoading]         = useState(true);   // true trong lúc xác minh phiên khi mount
  const [lockedMessage, setLockedMessage] = useState(null);

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

  // Lắng nghe sự kiện tài khoản bị khóa từ axiosClient
  useEffect(() => {
    const handler = (e) => {
      setLockedMessage(e.detail?.message || 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    };
    window.addEventListener('auth:account-locked', handler);
    return () => window.removeEventListener('auth:account-locked', handler);
  }, []);

  const login = useCallback((userData) => {
    setUser(enrichUser(userData));
  }, []);

  const logout = useCallback(async () => {
    // Reset state phía client trước để UI quay về màn hình đăng nhập ngay lập tức.
    // Không được chờ server phản hồi: sau khi đổi mật khẩu, access token đã bị
    // thu hồi nên requestLogout() trả 401, và interceptor của nó không thể
    // chuyển hướng tin cậy một SPA vốn đang ở sẵn '/'.
    setUser(null);
    try { await requestLogout(); } catch { /* token có thể đã bị thu hồi */ }
  }, []);

  const clearLockedMessage = useCallback(() => setLockedMessage(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, lockedMessage, clearLockedMessage }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook truy cập context xác thực
export const useAuth = () => useContext(AuthContext);
