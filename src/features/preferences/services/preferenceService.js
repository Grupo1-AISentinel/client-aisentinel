import { preferencesApi } from '../../../shared/api/adminApi.js';

export const preferenceService = {
  getAlerts: () => preferencesApi.getAlerts(),
  updateAlerts: (payload) => preferencesApi.updateAlerts(payload),
};
