import { alertsApi } from '../../../shared/api/adminApi.js';
import { extractErrorMessage, isNotFoundError } from '../../../shared/api/errors.js';

export const alertService = {
  async list(params = {}) {
    try {
      const response = await alertsApi.getAll(params);
      return {
        data: response.alerts || response.data || [],
        pagination: response.pagination || { currentPage: 1, totalPages: 1, totalRecords: 0 },
      };
    } catch (err) {
      if (isNotFoundError(err)) {
        return { data: [], pagination: { currentPage: 1, totalPages: 1, totalRecords: 0 } };
      }
      throw new Error(extractErrorMessage(err));
    }
  },
  async getByIdCard(idCard) {
    try {
      const response = await alertsApi.getByIdCard(idCard);
      return response.alerts || response.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
