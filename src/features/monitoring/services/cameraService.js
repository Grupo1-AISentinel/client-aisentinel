import { camerasApi } from '../../../shared/api/adminApi.js';
import { extractErrorMessage } from '../../../shared/api/errors.js';

export const cameraService = {
  async getActive() {
    try {
      const response = await camerasApi.getActive();
      return response.cameras || response.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
