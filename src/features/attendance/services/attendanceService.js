import { attendanceApi } from '../../../shared/api/adminApi.js';
import { extractErrorMessage } from '../../../shared/api/errors.js';

export const attendanceService = {
  async getDaily() {
    try {
      const response = await attendanceApi.getDaily();
      return response.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
