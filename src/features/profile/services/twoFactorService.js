import { authApi } from '../../../shared/api/authApi.js';
import { extractErrorMessage } from '../../../shared/api/errors.js';
import { getAuthClient } from '../../../shared/api/clients.js';

const ensureSuccess = (response) => {
  if (response && response.success === false) {
    throw new Error(response.message || 'Operación rechazada por el servidor');
  }
  return response;
};

export const twoFactorService = {
  async getStatus() {
    try {
      const response = ensureSuccess(await authApi.get2FAStatus());
      return response;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async setup() {
    try {
      const response = ensureSuccess(await authApi.setup2FA());
      return response;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async getQRCode() {
    try {
      const client = getAuthClient();
      const res = await client.get('/two-factor/setup/qr', { responseType: 'blob' });
      return URL.createObjectURL(res.data);
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async verifyAndEnable(code) {
    try {
      const response = ensureSuccess(await authApi.verifyAndEnable2FA(code));
      return response;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async disable(code) {
    try {
      const response = ensureSuccess(await authApi.disable2FA(code));
      return response;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async regenerateRecoveryCodes() {
    try {
      const response = ensureSuccess(await authApi.regenerateRecoveryCodes());
      return response;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
