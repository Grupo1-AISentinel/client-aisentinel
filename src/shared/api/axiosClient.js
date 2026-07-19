import axios from 'axios';
import { ApiError, API_ERROR_CODES, classifyHttpError, extractErrorMessage } from './errors.js';

export const isFormData = (value) => typeof FormData !== 'undefined' && value instanceof FormData;

export const createApiClient = ({ baseURL, getToken, onUnauthorized, onForbidden }) => {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      Accept: 'application/json',
    },
  });

  client.interceptors.request.use(
    (config) => {
      const token = getToken?.();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (config.data !== undefined && isFormData(config.data)) {
        delete config.headers['Content-Type'];
      } else if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isCancel(error)) {
        return Promise.reject(
          new ApiError({ code: API_ERROR_CODES.NETWORK, message: 'Petición cancelada' })
        );
      }

      if (!error.response) {
        return Promise.reject(
          new ApiError({
            code: API_ERROR_CODES.NETWORK,
            message: 'No se pudo conectar con el servidor. Verifica tu conexión.',
          })
        );
      }

      const { status, data } = error.response;
      const code = classifyHttpError(status);
      const message = extractErrorMessage(error, 'Error en la petición');

      if (status === 401) onUnauthorized?.(data);
      if (status === 403) onForbidden?.(data);

      return Promise.reject(new ApiError({ code, message, status, details: data }));
    }
  );

  return client;
};
