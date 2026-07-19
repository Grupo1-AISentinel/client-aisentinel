import { studentsApi } from '../../../shared/api/adminApi.js';
import { extractErrorMessage } from '../../../shared/api/errors.js';

const buildPayload = (form) => {
  const data = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    if (key === 'photos' && Array.isArray(value)) {
      value.forEach((file) => {
        if (file instanceof File) data.append('photo', file);
      });
    } else {
      data.append(key, String(value));
    }
  });
  return data;
};

export const studentService = {
  async list(params) {
    try {
      const response = await studentsApi.getAll(params);
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
      const response = await studentsApi.getById(id);
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  async getByIdCard(idCard) {
    try {
      const response = await studentsApi.getByIdCard(idCard);
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  async create(form) {
    try {
      const response = await studentsApi.create(buildPayload(form));
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  async update(id, form) {
    try {
      const response = await studentsApi.update(id, buildPayload(form));
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  async toggleActive(student) {
    try {
      if (student.isActive) {
        const response = await studentsApi.deactivate(student._id);
        return response.data;
      }
      const response = await studentsApi.activate(student._id);
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  async remove(id) {
    try {
      await studentsApi.delete(id);
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
