import { getAdminClient } from '../../../shared/api/clients.js';
import { extractErrorMessage } from '../../../shared/api/errors.js';

const buildFormData = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    if (key === 'file' && value instanceof File) {
      formData.append('file', value);
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
};

const unwrap = (promise) =>
  promise
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(extractErrorMessage(err));
    });

export const models3dApi = {
  getAll: (params) => unwrap(getAdminClient().get('/models3d/get', { params })),
  getById: (id) => unwrap(getAdminClient().get(`/models3d/${id}`)),
  create: (data) => unwrap(getAdminClient().post('/models3d/create', buildFormData(data))),
  update: (id, data) => unwrap(getAdminClient().put(`/models3d/${id}`, data)),
  activate: (id) => unwrap(getAdminClient().put(`/models3d/${id}/activate`)),
  deactivate: (id) => unwrap(getAdminClient().put(`/models3d/${id}/deactivate`)),
  delete: (id) => unwrap(getAdminClient().delete(`/models3d/${id}`)),
};

export const models3dService = {
  async list(params) {
    try {
      const response = await models3dApi.getAll(params);
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
      const response = await models3dApi.getById(id);
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async create(form) {
    try {
      const response = await models3dApi.create(form);
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async update(id, data) {
    try {
      const response = await models3dApi.update(id, data);
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async activate(id) {
    try {
      const response = await models3dApi.activate(id);
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async deactivate(id) {
    try {
      const response = await models3dApi.deactivate(id);
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
  async remove(id) {
    try {
      const response = await models3dApi.delete(id);
      return response;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
