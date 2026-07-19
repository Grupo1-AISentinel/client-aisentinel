import { getAuthClient } from './clients.js';
import { extractErrorMessage } from './errors.js';

const unwrap = (promise) =>
  promise
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(extractErrorMessage(err));
    });

export const authApi = {
  login: (payload) => unwrap(getAuthClient().post('/auth/login', payload)),
  verifyTwoFactor: ({ code, token }) =>
    unwrap(getAuthClient().post('/auth/verify-2fa', { code }, { headers: { 'x-token': token } })),
  getProfile: () => unwrap(getAuthClient().get('/auth/profile')),
  getProfileById: (userId) => unwrap(getAuthClient().post('/auth/profile/by-id', { userId })),
  verifyEmail: (token) => unwrap(getAuthClient().post('/auth/verify-email', { token })),
  resendVerification: (email) =>
    unwrap(getAuthClient().post('/auth/resend-verification', { email })),
  forgotPassword: (email) => unwrap(getAuthClient().post('/auth/forgot-password', { email })),
  resetPassword: (payload) => unwrap(getAuthClient().post('/auth/reset-password', payload)),
  heartbeat: () => unwrap(getAuthClient().post('/auth/heartbeat')),
  setup2FA: () => unwrap(getAuthClient().post('/two-factor/setup')),
  getQRCode: () => unwrap(getAuthClient().get('/two-factor/setup/qr')),
  verifyAndEnable2FA: (code) =>
    unwrap(getAuthClient().post('/two-factor/verify-and-enable', { code })),
  disable2FA: (code) => unwrap(getAuthClient().post('/two-factor/disable', { code })),
  get2FAStatus: () => unwrap(getAuthClient().get('/two-factor/status')),
  regenerateRecoveryCodes: () => unwrap(getAuthClient().post('/two-factor/recovery-codes')),
  getUserRoles: (userId) => unwrap(getAuthClient().get(`/users/${userId}/roles`)),
  getUsersByRole: (roleName) => unwrap(getAuthClient().get(`/users/by-role/${roleName}`)),
  updateUserRole: (userId, roleName) =>
    unwrap(getAuthClient().put(`/users/${userId}/role`, { roleName })),
};
