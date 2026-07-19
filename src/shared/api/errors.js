export const API_ERROR_CODES = {
  NETWORK: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

export class ApiError extends Error {
  constructor({ code, message, status, details }) {
    super(message || 'Error en la petición');
    this.name = 'ApiError';
    this.code = code || API_ERROR_CODES.UNKNOWN;
    this.status = status || 0;
    this.details = details;
  }
}

export const classifyHttpError = (status) => {
  if (status === 401) return API_ERROR_CODES.UNAUTHORIZED;
  if (status === 403) return API_ERROR_CODES.FORBIDDEN;
  if (status === 404) return API_ERROR_CODES.NOT_FOUND;
  if (status >= 400 && status < 500) return API_ERROR_CODES.VALIDATION;
  if (status >= 500) return API_ERROR_CODES.SERVER;
  return API_ERROR_CODES.UNKNOWN;
};

export const extractErrorMessage = (error, fallback = 'Ha ocurrido un error inesperado') => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  const data = error.response?.data;
  if (data) {
    // Si data es ArrayBuffer (responseType: 'arraybuffer'), decodificar a JSON
    if (data instanceof ArrayBuffer) {
      try {
        const text = new TextDecoder().decode(data);
        const json = JSON.parse(text);
        if (json.message) return json.message;
        if (json.error) return json.error;
      } catch {
        return fallback;
      }
    }
    if (data.message) return data.message;
    if (data.error) return data.error;
  }
  if (error.message) return error.message;
  return fallback;
};

export const isNotFoundError = (error) => {
  if (!error) return false;
  if (error.code === API_ERROR_CODES.NOT_FOUND) return true;
  if (error.response?.status === 404) return true;
  if (error.status === 404) return true;
  return false;
};
