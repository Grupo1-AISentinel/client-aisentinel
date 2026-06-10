import { useState } from 'react';
import { authService } from '../services/authService.js';

export const useTwoFactor = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async (code) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.verifyTwoFactor(code);
      return result;
    } catch (err) {
      setError(err.message || 'Código inválido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleVerify, clearError: () => setError(null) };
};
