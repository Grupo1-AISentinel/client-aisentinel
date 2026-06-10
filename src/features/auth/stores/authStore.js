import { create } from 'zustand';
import { clearAuthStorage } from '../../../shared/api/clients.js';
import { STORAGE_KEYS } from '../../../shared/utils/constants.js';
import { isJwtExpired } from '../../../shared/utils/jwt.js';
import { registerStoreLogout } from '../../../shared/auth/session-cleanup.js';
import { useNotificationStore } from '../../notifications/stores/notificationStore.js';

const persist = (state) => {
  try {
    if (state.token) {
      localStorage.setItem(
        STORAGE_KEYS.AUTH,
        JSON.stringify({
          token: state.token,
          user: state.user,
          role: state.role,
          expiresAt: state.expiresAt,
          coordinatorGrade: state.coordinatorGrade,
        })
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  } catch {
    /* ignore quota errors */
  }
};

const loadPersisted = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isJwtExpired(parsed?.token)) {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      return null;
    }
    if (parsed?.expiresAt && new Date(parsed.expiresAt) < new Date()) {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const persisted = loadPersisted();

const decodeJwt = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  user: persisted?.user || null,
  token: persisted?.token || null,
  role: persisted?.role || persisted?.user?.role || null,
  expiresAt: persisted?.expiresAt || null,
  coordinatorGrade: persisted?.coordinatorGrade ?? null,
  isAuthenticated: Boolean(persisted?.token),
  requiresTwoFactor: false,
  twoFAToken: null,
  twoFactorPending: false,

  setAuth: ({ token, userDetails, expiresAt, role, coordinatorGrade }) => {
    const nextRole = role || userDetails?.role || null;
    const nextState = {
      token,
      user: userDetails,
      role: nextRole,
      expiresAt,
      isAuthenticated: true,
      requiresTwoFactor: false,
      twoFAToken: null,
      twoFactorPending: false,
    };
    if (coordinatorGrade !== undefined) {
      nextState.coordinatorGrade = coordinatorGrade;
    }
    set(nextState);
    persist({
      token,
      user: userDetails,
      role: nextRole,
      expiresAt,
      coordinatorGrade: nextState.coordinatorGrade,
      isAuthenticated: true,
    });
  },

  setTwoFactorChallenge: (twoFAToken) => {
    set({
      requiresTwoFactor: true,
      twoFAToken,
      twoFactorPending: true,
      token: null,
      isAuthenticated: false,
    });
  },

  cancelTwoFactor: () => {
    set({
      requiresTwoFactor: false,
      twoFAToken: null,
      twoFactorPending: false,
    });
  },

  updateUser: (user) => {
    const current = get();
    const nextUser = { ...current.user, ...user };
    set({ user: nextUser });
    persist({
      token: current.token,
      user: nextUser,
      role: current.role,
      expiresAt: current.expiresAt,
      coordinatorGrade: current.coordinatorGrade,
      isAuthenticated: current.isAuthenticated,
    });
  },

  setCoordinatorGrade: (coordinatorGrade) => {
    const current = get();
    set({ coordinatorGrade });
    persist({
      token: current.token,
      user: current.user,
      role: current.role,
      expiresAt: current.expiresAt,
      coordinatorGrade,
      isAuthenticated: current.isAuthenticated,
    });
  },

  logout: () => {
    set({
      user: null,
      token: null,
      role: null,
      expiresAt: null,
      coordinatorGrade: null,
      isAuthenticated: false,
      requiresTwoFactor: false,
      twoFAToken: null,
      twoFactorPending: false,
    });
    clearAuthStorage();
    try {
      useNotificationStore.getState().clear();
    } catch {
      /* noop si el módulo aún no se importó en esta ruta */
    }
  },

  getTokenPayload: () => decodeJwt(get().token),
}));

// Registrar la función de logout en el módulo de cleanup para que los clientes HTTP
// puedan cerrar la sesión sin generar una dependencia circular con clients.js.
registerStoreLogout(() => useAuthStore.getState().logout());
