import { authService } from '../services/authService.js';

export const useLogout = () => {
  const logout = () => {
    authService.logout();
    window.location.replace('/login');
  };
  return { logout };
};
