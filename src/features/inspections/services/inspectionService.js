import { inspectionsApi } from '../../../shared/api/adminApi.js';
import { extractErrorMessage } from '../../../shared/api/errors.js';

export const inspectionService = {
  async list() {
    try {
      const response = await inspectionsApi.getAll();
      const list = Array.isArray(response) ? response : response.data || [];
      return list;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  async toggle(grade) {
    try {
      const response = await inspectionsApi.toggle(grade);
      return response.data || response;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
