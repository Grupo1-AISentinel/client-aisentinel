import { createApiClient } from './axiosClient.js';
import { STORAGE_KEYS } from '../utils/constants.js';
import { isJwtExpired } from '../utils/jwt.js';
import {
  markUnauthorizedOnce,
  clearSession,
  logoutStore,
} from '../auth/session-cleanup.js';
import toast from 'react-hot-toast';

let _authClient = null;
let _adminClient = null;
let _camerasClient = null;
let _silentAdminClient = null;
let _suppressedUnauthorized = false;

const readAuthFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearAuthStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  } catch {
    /* ignore */
  }
};

const PUBLIC_PATHS = new Set(['/', '/login', '/forgot-password', '/reset-password', '/2fa']);

const handleUnauthorized = () => {
  if (_suppressedUnauthorized) return;
  if (typeof window === 'undefined') return;
  markUnauthorizedOnce(() => {
    const path = window.location.pathname;
    clearSession();
    logoutStore();
    if (PUBLIC_PATHS.has(path)) return;
    toast.error('Tu sesión ha expirado. Vuelve a iniciar sesión.', { duration: 5000 });
    const redirect = encodeURIComponent(path + window.location.search);
    setTimeout(() => {
      window.location.replace(`/?redirect=${redirect}`);
    }, 800);
  });
};

const getAuthToken = () => {
  const persisted = readAuthFromStorage();
  if (!persisted?.token) return null;
  if (isJwtExpired(persisted.token)) {
    clearSession();
    logoutStore();
    return null;
  }
  return persisted.token;
};

export const getAuthClient = () => {
  if (!_authClient) {
    _authClient = createApiClient({
      baseURL: import.meta.env.VITE_AUTH_URL,
      getToken: getAuthToken,
      onUnauthorized: handleUnauthorized,
    });
  }
  return _authClient;
};

export const getAdminClient = () => {
  if (!_adminClient) {
    _adminClient = createApiClient({
      baseURL: import.meta.env.VITE_ADMIN_URL,
      getToken: getAuthToken,
      onUnauthorized: handleUnauthorized,
      onForbidden: () => {
        if (typeof window !== 'undefined' && window.location.pathname !== '/unauthorized') {
          window.location.replace('/unauthorized');
        }
      },
    });
  }
  return _adminClient;
};

export const getCamerasClient = () => {
  if (!_camerasClient) {
    _camerasClient = createApiClient({
      baseURL: import.meta.env.VITE_ADMIN_URL,
      getToken: () => null,
    });
  }
  return _camerasClient;
};

// Cliente silencioso: para llamadas tolerantes a fallos (p. ej. coordinators/me durante el login)
// que NO deben disparar el cierre de sesión aunque retornen 401.
export const getSilentAdminClient = () => {
  if (!_silentAdminClient) {
    _silentAdminClient = createApiClient({
      baseURL: import.meta.env.VITE_ADMIN_URL,
      getToken: getAuthToken,
    });
  }
  return _silentAdminClient;
};
