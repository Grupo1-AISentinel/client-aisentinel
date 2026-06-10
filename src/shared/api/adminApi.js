import { getAdminClient, getCamerasClient, getSilentAdminClient } from './clients.js';
import { extractErrorMessage } from './errors.js';

const unwrap = (promise) =>
  promise
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(extractErrorMessage(err));
    });

const buildQuery = (params) => {
  if (!params) return undefined;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    search.append(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

export const studentsApi = {
  getAll: (params) => unwrap(getAdminClient().get(`/students/get${buildQuery(params)}`)),
  getById: (id) => unwrap(getAdminClient().get(`/students/${id}`)),
  getByIdCard: (idCard) => unwrap(getAdminClient().get(`/students/idcard/${idCard}`)),
  create: (formData) => unwrap(getAdminClient().post('/students/create', formData)),
  update: (id, formData) => unwrap(getAdminClient().put(`/students/${id}`, formData)),
  updateByIdCard: (idCard, formData) =>
    unwrap(getAdminClient().put(`/students/idcard/${idCard}`, formData)),
  activate: (id) => unwrap(getAdminClient().put(`/students/${id}/activate`)),
  deactivate: (id) => unwrap(getAdminClient().put(`/students/${id}/deactivate`)),
  delete: (id) => unwrap(getAdminClient().delete(`/students/${id}`)),
};

export const coordinatorsApi = {
  getAll: (params) => unwrap(getAdminClient().get(`/coordinators/get${buildQuery(params)}`)),
  getById: (id) => unwrap(getAdminClient().get(`/coordinators/${id}`)),
  // Usar cliente silencioso: un 401 aquí durante el login no debe cerrar la sesión
  getMe: () => unwrap(getSilentAdminClient().get('/coordinators/me')),
  create: (payload) => unwrap(getAdminClient().post('/coordinators/create', payload)),
  createAdmin: (payload) => unwrap(getAdminClient().post('/coordinators/admin/create', payload)),
  update: (id, payload) => unwrap(getAdminClient().put(`/coordinators/${id}`, payload)),
  activate: (id) => unwrap(getAdminClient().put(`/coordinators/${id}/activate`)),
  deactivate: (id) => unwrap(getAdminClient().put(`/coordinators/${id}/deactivate`)),
  delete: (id) => unwrap(getAdminClient().delete(`/coordinators/${id}`)),
};

export const uniformsApi = {
  getAll: (params) => unwrap(getAdminClient().get(`/uniforms/get${buildQuery(params)}`)),
  getByName: (name) => unwrap(getAdminClient().get(`/uniforms/${name}`)),
  getThumbnail: (name) => unwrap(getAdminClient().get(`/uniforms/${name}/thumbnail`)),
  create: (formData) => unwrap(getAdminClient().post('/uniforms/create', formData)),
  update: (name, formData) => unwrap(getAdminClient().put(`/uniforms/${name}`, formData)),
  activate: (name) => unwrap(getAdminClient().put(`/uniforms/${name}/activate`)),
  deactivate: (name) => unwrap(getAdminClient().put(`/uniforms/${name}/deactivate`)),
};

export const alertsApi = {
  getAll: (params) => unwrap(getAdminClient().get(`/alerts/get${buildQuery(params)}`)),
  getByIdCard: (idCard) => unwrap(getAdminClient().get(`/alerts/get?studentCard=${idCard}`)),
  simulate: (payload) => unwrap(getAdminClient().post('/alerts/simulate', payload)),
};

export const statisticsApi = {
  getGrades: () => unwrap(getAdminClient().get('/statistics/grades')),
  getStudents: () => unwrap(getAdminClient().get('/statistics/students')),
  getObjects: () => unwrap(getAdminClient().get('/statistics/objects')),
  getDays: () => unwrap(getAdminClient().get('/statistics/days')),
  exportGrades: ({ email = null, format = 'pdf', sections } = {}) =>
    email
      ? unwrap(getAdminClient().post('/statistics/grades/export', { email, format, sections }))
      : unwrap(
          getAdminClient().post(
            '/statistics/grades/export',
            { email: null, format, sections },
            { responseType: 'arraybuffer' }
          )
        ),
  exportStudents: ({ email = null, format = 'pdf', sections } = {}) =>
    email
      ? unwrap(getAdminClient().post('/statistics/students/export', { email, format, sections }))
      : unwrap(
          getAdminClient().post(
            '/statistics/students/export',
            { email: null, format, sections },
            { responseType: 'arraybuffer' }
          )
        ),
  exportObjects: ({ email = null, format = 'pdf', sections } = {}) =>
    email
      ? unwrap(getAdminClient().post('/statistics/objects/export', { email, format, sections }))
      : unwrap(
          getAdminClient().post(
            '/statistics/objects/export',
            { email: null, format, sections },
            { responseType: 'arraybuffer' }
          )
        ),
  exportDays: ({ email = null, format = 'pdf', sections } = {}) =>
    email
      ? unwrap(getAdminClient().post('/statistics/days/export', { email, format, sections }))
      : unwrap(
          getAdminClient().post(
            '/statistics/days/export',
            { email: null, format, sections },
            { responseType: 'arraybuffer' }
          )
        ),
};

export const auditsApi = {
  getAll: (params) => unwrap(getAdminClient().get(`/audits/get${buildQuery(params)}`)),
};

export const attendanceApi = {
  getDaily: () => unwrap(getAdminClient().get('/attendance/daily-list')),
};

export const inspectionsApi = {
  toggle: (grade) => unwrap(getAdminClient().put(`/inspections/toggle/${grade}`)),
  getAll: () => unwrap(getAdminClient().get('/inspections')),
};

export const camerasApi = {
  sendHeartbeat: (payload) => unwrap(getCamerasClient().post('/cameras/heartbeat', payload)),
  getActive: () => unwrap(getAdminClient().get('/cameras/active')),
  list: (params) => unwrap(getAdminClient().get(`/cameras/get${buildQuery(params)}`)),
  getById: (id) => unwrap(getAdminClient().get(`/cameras/${id}`)),
  create: (payload) => unwrap(getAdminClient().post('/cameras/create', payload)),
  update: (id, payload) => unwrap(getAdminClient().put(`/cameras/${id}`, payload)),
  remove: (id) => unwrap(getAdminClient().delete(`/cameras/${id}`)),
  listVideoAssets: () => unwrap(getAdminClient().get('/cameras/videos')),
};

export const notificationsApi = {
  getMy: (params) => unwrap(getAdminClient().get(`/notifications${buildQuery(params)}`)),
  getUnreadCount: () => unwrap(getAdminClient().get('/notifications/unread-count')),
  markAllRead: () => unwrap(getAdminClient().post('/notifications/mark-read')),
};

export const preferencesApi = {
  getAlerts: () => unwrap(getAdminClient().get('/preferences/alerts')),
  updateAlerts: (payload) => unwrap(getAdminClient().put('/preferences/alerts', payload)),
};

export const testApi = {
  detect: (formData, mode = 'clothing', { signal } = {}) =>
    unwrap(
      getAdminClient().post(`/admin/test-detection?mode=${mode}`, formData, {
        timeout: 60000,
        signal,
      })
    ),
};
