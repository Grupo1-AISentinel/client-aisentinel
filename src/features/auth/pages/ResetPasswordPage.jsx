import { useForm } from 'react-hook-form';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { useResetPassword } from '../hooks/usePasswordReset.js';
import { Button, Input } from '../../../shared/components/ui/index.js';
import { CheckCircle as CheckCircle2, ArrowRight, AlertCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const { loading, error, success, handleReset } = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ mode: 'onBlur' });

  const onSubmit = async (data) => {
    await handleReset({ token, newPassword: data.newPassword });
  };

  if (success) {
    return (
      <div className="w-full animate-fade-in">
        <div className="flex flex-col items-center text-center gap-5">
          <div
            className="w-16 h-16 rounded-xl bg-success/15 border border-success/30 flex items-center justify-center animate-boot-up"
            aria-hidden
          >
            <CheckCircle2 className="w-8 h-8 text-success-bright" />
          </div>
          <header className="flex flex-col gap-3">
            <span className="font-mono text-[10px] tracking-[0.22em] text-amber-300/80 inline-flex items-center gap-2 justify-center">
              <span className="inline-block w-6 h-px bg-amber-300/60" aria-hidden />
              CONTRASEÑA ACTUALIZADA
            </span>
            <h1 className="font-display text-[clamp(2rem,3.4vw,2.75rem)] font-extrabold text-on-surface tracking-[-0.03em] leading-[1.05]">
              Listo, ya puedes <span className="wordmark-gradient">ingresar</span>
            </h1>
            <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-sm">
              Tu nueva contraseña está activa. Inicia sesión para continuar.
            </p>
          </header>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => {
              navigate('/login', { replace: true });
              toast.success('Inicia sesión con tu nueva contraseña');
            }}
          >
            Ir a iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-full animate-fade-in">
        <div className="flex flex-col items-center text-center gap-5">
          <div
            className="w-16 h-16 rounded-xl bg-error/15 border border-error/30 flex items-center justify-center"
            aria-hidden
          >
            <AlertCircle className="w-8 h-8 text-error-bright" />
          </div>
          <header className="flex flex-col gap-3">
            <span className="font-mono text-[10px] tracking-[0.22em] text-error-bright/90 inline-flex items-center gap-2 justify-center">
              <span className="inline-block w-6 h-px bg-error-bright/60" aria-hidden />
              ENLACE INVÁLIDO
            </span>
            <h1 className="font-display text-[clamp(2rem,3.4vw,2.75rem)] font-extrabold text-on-surface tracking-[-0.03em] leading-[1.05]">
              Enlace <span className="text-error-bright">caducado</span>
            </h1>
            <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-sm">
              El enlace de recuperación no es válido o ha expirado.
            </p>
          </header>
          <Link
            to="/forgot-password"
            className="font-mono text-[11px] tracking-[0.16em] text-amber-300/90 hover:text-amber-200 transition-colors duration-200 inline-flex items-center gap-2"
          >
            SOLICITAR UNO NUEVO
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col gap-7">
        <header
          className="flex flex-col gap-3 animate-fade-in-up"
          style={{ animationDelay: '60ms' }}
        >
          <span className="font-mono text-[10px] tracking-[0.22em] text-amber-300/80 inline-flex items-center gap-2">
            <span className="inline-block w-6 h-px bg-amber-300/60" aria-hidden />
            NUEVA CONTRASEÑA
          </span>
          <h1 className="font-display text-[clamp(2rem,3.4vw,2.75rem)] font-extrabold text-on-surface tracking-[-0.03em] leading-[1.05]">
            Crea una nueva <span className="wordmark-gradient">clave</span>
          </h1>
          <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-sm">
            Tu nueva contraseña debe tener al menos 8 caracteres.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Input
              label="Nueva contraseña"
              type="password"
              autoComplete="new-password"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.newPassword?.message}
              required
              {...register('newPassword', {
                required: 'La contraseña es requerida',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              })}
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Input
              label="Confirmar contraseña"
              type="password"
              autoComplete="new-password"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword', {
                required: 'Confirma la contraseña',
                validate: (value) =>
                  value === watch('newPassword') || 'Las contraseñas no coinciden',
              })}
            />
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

          <div
            className="flex flex-col gap-2 mt-1 animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {loading ? 'Actualizando…' : 'Actualizar contraseña'}
            </Button>
            <Link
              to="/login"
              className="font-mono text-[11px] tracking-[0.16em] text-on-surface-variant hover:text-amber-300 transition-colors duration-200 py-2 inline-flex items-center justify-center"
            >
              VOLVER AL INICIO
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
