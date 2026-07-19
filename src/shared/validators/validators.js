export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const isEmail = (value) => {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim().toLowerCase());
};

export const isIdCard = (value) => {
  if (!value) return false;
  return /^\d{6,7}$/.test(String(value).trim());
};

export const isPhone = (value) => {
  if (!value) return false;
  return /^\d{8}$/.test(String(value).trim());
};

export const minLength = (n) => (value) =>
  value === undefined || value === null || String(value).length >= n || `Mínimo ${n} caracteres`;

export const composeValidators =
  (...validators) =>
  (value, allValues) => {
    for (const validator of validators) {
      if (typeof validator !== 'function') continue;
      const result = validator(value, allValues);
      if (result !== true && result !== undefined && result !== null) {
        return result;
      }
    }
    return true;
  };
