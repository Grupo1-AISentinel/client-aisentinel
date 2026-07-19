// Helpers de limpieza de sesión que se pueden llamar desde cualquier cliente HTTP
// sin generar dependencias circulares con authStore (que importa clients.js).

import { clearAuthStorage } from '../api/clients.js';

let _unauthorizedInFlight = false;

export const markUnauthorizedOnce = (callback) => {
  if (_unauthorizedInFlight) return false;
  _unauthorizedInFlight = true;
  try {
    callback();
  } finally {
    setTimeout(() => {
      _unauthorizedInFlight = false;
    }, 1500);
  }
  return true;
};

export const clearSession = () => {
  clearAuthStorage();
};

let _storeLogoutRef = null;
export const registerStoreLogout = (fn) => {
  _storeLogoutRef = typeof fn === 'function' ? fn : null;
};

export const logoutStore = () => {
  if (_storeLogoutRef) {
    try {
      _storeLogoutRef();
    } catch {
      /* el store tolera fallos */
    }
  }
};
