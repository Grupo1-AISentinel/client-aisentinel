import { statisticsApi } from '../../../shared/api/adminApi.js';
import { extractErrorMessage } from '../../../shared/api/errors.js';

export const statisticsService = {
  async getGrades() {
    try {
      const response = await statisticsApi.getGrades();
      return response.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async getStudents() {
    try {
      const response = await statisticsApi.getStudents();
      return response.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async getObjects() {
    try {
      const response = await statisticsApi.getObjects();
      return response.data || null;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async getDays() {
    try {
      const response = await statisticsApi.getDays();
      return response.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async exportGrades(email) {
    try {
      const response = await statisticsApi.exportGrades(email);
      return response;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async exportStudents(email) {
    try {
      const response = await statisticsApi.exportStudents(email);
      return response;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async exportObjects(email) {
    try {
      const response = await statisticsApi.exportObjects(email);
      return response;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async exportDays(email) {
    try {
      const response = await statisticsApi.exportDays(email);
      return response;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
