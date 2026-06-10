import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useLogin } from '../hooks/useLogin.js';
import { Button, Input } from '../../../shared/components/ui/index.js';
import { User, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const LoginForm = () => {
  const navigate = useNavigate();
  const { loading, error, handleLogin, clearError } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });

  const onSubmit = async (data) => {
    clearError();
    try {
      const result = await handleLogin(data);
      if (result.requiresTwoFactor) {
        navigate('/2fa', { replace: true });
        toast('Ingresa el código de tu aplicación autenticadora', {
          icon: '🔐',
        });
      } else {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || '/dashboard';
        navigate(redirect, { replace: true });
        toast.success('Bienvenido a AISentinel');
      }
    } catch {
      /* el error ya quedó en el estado */
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4" noValidate>
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <Input
          label="Usuario o correo"
          type="text"
          autoComplete="username"
          placeholder="Usuario o Email"
          leftIcon={<User />}
          error={errors.emailOrUsername?.message}
          required
          {...register('emailOrUsername', {
            required: 'El usuario o correo es requerido',
          })}
        />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <Input
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          leftIcon={<Lock />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-on-surface-variant hover:text-amber-300 transition-colors focus-visible:outline-none focus-visible:text-amber-300"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          error={errors.password?.message}
          required
          {...register('password', {
            required: 'La contraseña es requerida',
            minLength: { value: 8, message: 'Mínimo 8 caracteres' },
          })}
        />
      </div>

      <div
        className="flex justify-between items-center px-1 mt-1 animate-fade-in-up"
        style={{ animationDelay: '400ms' }}
      >
        <label className="flex items-center gap-2.5 cursor-pointer group select-none">
          <span className="relative w-4 h-4 rounded border border-white/20 bg-surface-container-low flex items-center justify-center group-hover:border-amber-300/60 peer-focus-within:border-amber-300 transition-colors">
            <input
              type="checkbox"
              className="sr-only peer"
              {...register('remember')}
              aria-label="Recordar credenciales"
            />
            <svg
              className="w-3 h-3 text-amber-300 opacity-0 peer-checked:opacity-100 transition-opacity"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 8.5L6.5 12L13 4.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
            Recordar credenciales
          </span>
        </label>
      </div>

      {error && (
        <div
          role="alert"
          className="text-sm text-error-bright bg-error/10 border border-error/30 rounded-md px-3.5 py-2.5 flex items-start gap-2.5 animate-fade-in"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-1 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          fullWidth
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {loading ? 'Verificando credenciales…' : 'Acceder al Sentinel'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
