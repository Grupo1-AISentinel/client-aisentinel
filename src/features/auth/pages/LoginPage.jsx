import { Link } from 'react-router';
import LoginForm from '../components/LoginForm.jsx';

const LoginPage = () => {
  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col gap-7">
        <header
          className="flex flex-col gap-3 animate-fade-in-up"
          style={{ animationDelay: '60ms' }}
        >
          <span className="font-mono text-[10px] tracking-[0.22em] text-amber-300/80 inline-flex items-center gap-2">
            <span className="inline-block w-6 h-px bg-amber-300/60" aria-hidden />
            INICIO DE SESIÓN
          </span>
          <h1 className="font-display text-[clamp(2rem,3.4vw,2.75rem)] font-extrabold text-on-surface tracking-[-0.03em] leading-[1.05]">
            Accede a tu <span className="wordmark-gradient">Sentinel</span>
          </h1>
          <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-sm">
            Ingresa al mejor sistema de supervisión estudiantil
          </p>
        </header>

        <LoginForm />

        <div className="text-center text-sm pt-2 border-t border-white/5">
          <Link
            to="/forgot-password"
            className="font-mono text-[11px] tracking-[0.16em] text-amber-300/90 hover:text-amber-200 transition-colors duration-200 inline-flex items-center gap-2 group"
          >
            ¿OLVIDASTE TU CONTRASEÑA?
            <span
              className="inline-block w-0 h-px bg-amber-300 group-hover:w-6 transition-all duration-300"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
