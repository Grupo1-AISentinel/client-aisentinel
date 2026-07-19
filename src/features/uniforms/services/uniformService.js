import { uniformsApi } from '../../../shared/api/adminApi.js';
import { extractErrorMessage } from '../../../shared/api/errors.js';

const buildPayload = (form) => {
  const data = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    if (key === 'images' && Array.isArray(value)) {
      value.forEach((file) => {
        if (file instanceof File) data.append('images', file);
      });
    } else if (key === 'image' && value instanceof File) {
      data.append('image', value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => data.append(key, String(v)));
    } else {
      data.append(key, String(value));
    }
  });
  return data;
};

export const uniformService = {
  async list(params) {
    try {
      const response = await uniformsApi.getAll(params);
      return {
        data: response.data || [],
        pagination: response.pagination || { currentPage: 1, totalPages: 1, totalRecords: 0 },
      };
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async getByName(name) {
    try {
      const response = await uniformsApi.getByName(name);
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async create(form) {
    try {
      const response = await uniformsApi.create(buildPayload(form));
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async update(name, form) {
    try {
      const response = await uniformsApi.update(name, buildPayload(form));
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async toggleActive(uniform) {
    try {
      if (uniform.isActive) {
        return (await uniformsApi.deactivate(uniform.name)).data;
      }
      return (await uniformsApi.activate(uniform.name)).data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
