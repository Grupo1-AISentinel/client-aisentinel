import { authApi } from '../../../shared/api/authApi.js';
import { coordinatorsApi } from '../../../shared/api/adminApi.js';
import { useAuthStore } from '../stores/authStore.js';
import { extractErrorMessage, isNotFoundError } from '../../../shared/api/errors.js';
import { ApiError } from '../../../shared/api/errors.js';
import { isJwtExpired } from '../../../shared/utils/jwt.js';

const ensureSuccess = (response) => {
  if (response && response.success === false) {
    throw new Error(response.message || 'Operación rechazada por el servidor');
  }
  return response;
};

const handleError = (err) => {
  if (err instanceof ApiError) {
    throw new Error(err.message);
  }
  throw new Error(extractErrorMessage(err));
};

const fetchCoordinatorGrade = async () => {
  try {
    const data = await coordinatorsApi.getMe();
    if (data?.isAdmin) {
      return null;
    }
    return data?.coordinator?.grade || null;
  } catch (err) {
    if (isNotFoundError(err)) return null;
    return null;
  }
};

export const authService = {
  async login(credentials) {
    try {
      const response = ensureSuccess(await authApi.login(credentials));
      if (response.requiresTwoFactor) {
        useAuthStore.getState().setTwoFactorChallenge(response.twoFAToken);
        return { requiresTwoFactor: true };
      }
      // Persistir la sesión ANTES de llamar al admin para que el token viaje en la request
      useAuthStore.getState().setAuth({
        token: response.token,
        userDetails: response.userDetails,
        expiresAt: response.expiresAt,
        role: response.userDetails?.role,
        coordinatorGrade: null,
      });
      const coordinatorGrade = await fetchCoordinatorGrade();
      if (coordinatorGrade !== null) {
        useAuthStore.getState().setCoordinatorGrade(coordinatorGrade);
      }
      return { requiresTwoFactor: false };
    } catch (err) {
      handleError(err);
    }
  },

  async verifyTwoFactor(code) {
    const { twoFAToken, cancelTwoFactor } = useAuthStore.getState();
    if (!twoFAToken) throw new Error('No hay desafío 2FA activo');
    try {
      const response = ensureSuccess(await authApi.verifyTwoFactor({ code, token: twoFAToken }));
      useAuthStore.getState().setAuth({
        token: response.token,
        userDetails: response.userDetails,
        expiresAt: response.expiresAt,
        role: response.userDetails?.role,
        coordinatorGrade: null,
      });
      const coordinatorGrade = await fetchCoordinatorGrade();
      if (coordinatorGrade !== null) {
        useAuthStore.getState().setCoordinatorGrade(coordinatorGrade);
      }
      return response;
    } catch (err) {
      handleError(err);
    } finally {
      cancelTwoFactor();
    }
  },

  async fetchProfile() {
    try {
      const response = ensureSuccess(await authApi.getProfile());
      useAuthStore.getState().updateUser(response.data);
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },

  async fetchCoordinatorGrade() {
    const grade = await fetchCoordinatorGrade();
    if (grade) {
      useAuthStore.getState().setCoordinatorGrade(grade);
    } else {
      useAuthStore.getState().setCoordinatorGrade(null);
    }
    return grade;
  },

  async requestPasswordReset(email) {
    try {
      const response = ensureSuccess(await authApi.forgotPassword(email));
      return response;
    } catch (err) {
      handleError(err);
    }
  },

  async resetPassword({ token, newPassword }) {
    try {
      const response = ensureSuccess(await authApi.resetPassword({ token, newPassword }));
      return response;
    } catch (err) {
      handleError(err);
    }
  },

  logout() {
    useAuthStore.getState().logout();
  },

  async heartbeat() {
    const token = useAuthStore.getState().token;
    if (!token || isJwtExpired(token)) return null;
    try {
      const response = await authApi.heartbeat();
      // El heartbeat reemite un token fresco (ver server-auth heartbeat
      // controller): guardarlo extiende la sesion mientras el usuario siga
      // activo, sin lo cual el token original expira a los 30 min pese a
      // que la pagina (p.ej. Monitoreo) siga en uso.
      if (response?.token) {
        useAuthStore.getState().renewToken(response.token, response.expiresAt);
      }
      return response;
    } catch {
      return null;
    }
  },
};
