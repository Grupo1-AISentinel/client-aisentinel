import { testApi } from '../../../shared/api/adminApi.js';

export const testService = {
  detect: (formData, mode = 'clothing') => testApi.detect(formData, mode),
};
