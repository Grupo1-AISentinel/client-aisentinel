import { Navigate } from 'react-router';
import { useAuthStore } from '../stores/authStore.js';
import TwoFactorForm from '../components/TwoFactorForm.jsx';

const TwoFactorPage = () => {
  const requiresTwoFactor = useAuthStore((s) => s.requiresTwoFactor);
  const twoFAToken = useAuthStore((s) => s.twoFAToken);

  if (!requiresTwoFactor || !twoFAToken) {
    return <Navigate to="/login" replace />;
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
            VERIFICACIÓN EN DOS PASOS
          </span>
          <h1 className="font-display text-[clamp(2rem,3.4vw,2.75rem)] font-extrabold text-on-surface tracking-[-0.03em] leading-[1.05]">
            Confirma tu <span className="wordmark-gradient">identidad</span>
          </h1>
          <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-sm">
            Ingresa el código de 6 dígitos de tu aplicación autenticadora para continuar.
          </p>
        </header>

        <TwoFactorForm />
      </div>
    </div>
  );
};

export default TwoFactorPage;
