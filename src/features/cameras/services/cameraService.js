import { camerasApi, alertsApi } from '../../../shared/api/adminApi.js';
import { extractErrorMessage } from '../../../shared/api/errors.js';
import { getAdminClient } from '../../../shared/api/clients.js';

const unwrapList = (response) => ({
  data: response.data || [],
  pagination: response.pagination || { currentPage: 1, totalPages: 1, totalRecords: 0 },
});

export const cameraService = {
  async list(params) {
    try {
      const response = await camerasApi.list(params);
      return unwrapList(response);
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  async getById(id) {
    try {
      const response = await camerasApi.getById(id);
      return response.camera || response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  async getActive() {
    try {
      const response = await camerasApi.getActive();
      return response.cameras || response.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  async create(payload) {
    try {
      const response = await camerasApi.create(payload);
      return response.camera || response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  async update(id, payload) {
    try {
      const response = await camerasApi.update(id, payload);
      return response.camera || response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  async remove(id) {
    try {
      await camerasApi.remove(id);
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  async listVideoAssets() {
    try {
      const response = await camerasApi.listVideoAssets();
      return response.videos || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  async uploadVideo(file) {
    try {
      const formData = new FormData();
      formData.append('video', file);
      const response = await getAdminClient().post('/cameras/upload-video', formData);
      return { filename: response.data.filename };
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  async simulateAlert(cameraId, overrides = {}) {
    try {
      const response = await alertsApi.simulate({ cameraId, ...overrides });
      return response.detection || response;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
