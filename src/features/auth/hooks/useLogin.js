import { useState } from 'react';
import { authService } from '../services/authService.js';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login(credentials);
      return result;
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleLogin, clearError: () => setError(null) };
};
