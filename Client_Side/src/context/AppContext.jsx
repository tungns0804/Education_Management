import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { I18N } from '../constants/i18n.constants';
import {
  LS_THEME,
  LS_LANG,
  DEFAULT_THEME,
  DEFAULT_LANG,
} from '../constants/storage.constants';

/* EduManage — App context: theme (sáng/tối) + ngôn ngữ (vi/en) + hàm dịch t() */

const AppCtx = createContext(null);
// Hook truy cập context ứng dụng (theme, ngôn ngữ, hàm dịch)
const useApp = () => useContext(AppCtx);

// Provider quản lý theme + ngôn ngữ, lưu lựa chọn vào localStorage, cung cấp hàm dịch t()
function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(LS_THEME) || DEFAULT_THEME);
  const [lang, setLang] = useState(() => localStorage.getItem(LS_LANG)  || DEFAULT_LANG);
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem(LS_THEME, theme); }, [theme]);
  useEffect(() => { localStorage.setItem(LS_LANG, lang); }, [lang]);
  const t = useCallback((k) => (I18N[lang][k] ?? k), [lang]);
  const tn = useCallback((o) => o ? (o['name_' + lang] ?? o.name ?? '') : '', [lang]);
  const val = { theme, setTheme, lang, setLang, t, tn,
    toggleTheme: () => setTheme(x => x === 'light' ? 'dark' : 'light'),
    toggleLang: () => setLang(x => x === 'vi' ? 'en' : 'vi') };
  return <AppCtx.Provider value={val}>{children}</AppCtx.Provider>;
}

export { AppCtx, useApp, AppProvider };
