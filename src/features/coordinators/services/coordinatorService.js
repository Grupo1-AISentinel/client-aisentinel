import { coordinatorsApi } from '../../../shared/api/adminApi.js';
import { extractErrorMessage } from '../../../shared/api/errors.js';

export const coordinatorService = {
  async list(params) {
    try {
      const response = await coordinatorsApi.getAll(params);
      return {
        data: response.data || [],
        pagination: response.pagination || { currentPage: 1, totalPages: 1, totalRecords: 0 },
      };
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async getById(id) {
    try {
      const response = await coordinatorsApi.getById(id);
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async create(payload) {
    try {
      const response = await coordinatorsApi.create(payload);
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async createAdmin(payload) {
    try {
      const response = await coordinatorsApi.createAdmin(payload);
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async update(id, payload) {
    try {
      const response = await coordinatorsApi.update(id, payload);
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async toggleActive(coordinator) {
    try {
      if (coordinator.isActive) {
        return (await coordinatorsApi.deactivate(coordinator._id)).data;
      }
      return (await coordinatorsApi.activate(coordinator._id)).data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async remove(id) {
    try {
      await coordinatorsApi.delete(id);
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
