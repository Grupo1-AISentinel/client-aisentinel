import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { useForgotPassword } from '../hooks/usePasswordReset.js';
import { Button, Input } from '../../../shared/components/ui/index.js';
import { Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const { loading, error, success, handleRequest } = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });

  if (success) {
    return (
      <div className="w-full animate-fade-in">
        <div className="flex flex-col items-center text-center gap-5">
          <div
            className="w-16 h-16 rounded-xl bg-success/15 border border-success/30 flex items-center justify-center animate-boot-up"
            aria-hidden
          >
            <CheckCircle className="w-8 h-8 text-success-bright" />
          </div>
          <header className="flex flex-col gap-3">
            <span className="font-mono text-[10px] tracking-[0.22em] text-amber-300/80 inline-flex items-center gap-2 justify-center">
              <span className="inline-block w-6 h-px bg-amber-300/60" aria-hidden />
              ENLACE ENVIADO
            </span>
            <h1 className="font-display text-[clamp(2rem,3.4vw,2.75rem)] font-extrabold text-on-surface tracking-[-0.03em] leading-[1.05]">
              Revisa tu <span className="wordmark-gradient">correo</span>
            </h1>
            <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-sm">
              Si la dirección está registrada, te enviamos un enlace para restablecer tu contraseña.
            </p>
          </header>
          <Link
            to="/login"
            className="font-mono text-[11px] tracking-[0.16em] text-amber-300/90 hover:text-amber-200 transition-colors duration-200 inline-flex items-center gap-2 group"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180 transition-transform group-hover:-translate-x-1" />
            VOLVER AL INICIO DE SESIÓN
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
            RECUPERAR CONTRASEÑA
          </span>
          <h1 className="font-display text-[clamp(2rem,3.4vw,2.75rem)] font-extrabold text-on-surface tracking-[-0.03em] leading-[1.05]">
            Restablece tu <span className="wordmark-gradient">acceso</span>
          </h1>
          <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-sm">
            Te enviaremos un enlace al correo registrado para crear una nueva contraseña.
          </p>
        </header>

        <form onSubmit={handleSubmit(handleRequest)} className="flex flex-col gap-4" noValidate>
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@correo.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              required
              {...register('email', {
                required: 'El correo es requerido',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Correo no válido',
                },
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
            style={{ animationDelay: '300ms' }}
          >
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {loading ? 'Enviando…' : 'Enviar enlace de recuperación'}
            </Button>
            <Link
              to="/login"
              className="font-mono text-[11px] tracking-[0.16em] text-on-surface-variant hover:text-amber-300 transition-colors duration-200 py-2 inline-flex items-center justify-center gap-2"
            >
              VOLVER AL INICIO
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
