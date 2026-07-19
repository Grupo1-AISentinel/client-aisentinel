import { useState } from 'react';
import { authService } from '../services/authService.js';

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRequest = async (formData) => {
    const email = typeof formData === 'string' ? formData : formData?.email;
    if (!email) {
      setError('El correo es requerido');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await authService.requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'No se pudo procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, handleRequest, clearError: () => setError(null) };
};

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async ({ token, newPassword }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await authService.resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'No se pudo resetear la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, handleReset, clearError: () => setError(null) };
};
