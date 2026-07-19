import { Link } from 'react-router';
import { ArrowRight, ShieldOff } from 'lucide-react';

const ForbiddenPage = () => {
  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col items-center text-center gap-6">
        <div
          className="w-16 h-16 rounded-xl bg-error/15 border border-error/30 flex items-center justify-center animate-boot-up"
          aria-hidden
        >
          <ShieldOff className="w-8 h-8 text-error-bright" />
        </div>

        <header className="flex flex-col gap-3">
          <span className="font-mono text-[10px] tracking-[0.22em] text-error-bright/90 inline-flex items-center gap-2 justify-center">
            <span className="inline-block w-6 h-px bg-error-bright/60" aria-hidden />
            ACCESO DENEGADO
          </span>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-extrabold text-on-surface tracking-[-0.04em] leading-none">
            <span className="text-error-bright">403</span>
          </h1>
          <h2 className="font-display text-xl font-semibold text-on-surface mt-2">
            Permisos insuficientes
          </h2>
          <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-sm">
            No tienes permisos para acceder a esta sección del Sentinel.
          </p>
        </header>

        <Link
          to="/dashboard"
          className="group inline-flex items-center justify-center gap-2.5 h-12 px-6 rounded-md bg-amber-400 text-amber-900 border border-amber-300/70 font-bold shadow-[0_8px_24px_-8px_rgba(245,197,58,0.55)] hover:bg-amber-300 hover:-translate-y-px hover:shadow-[0_12px_32px_-6px_rgba(245,197,58,0.7)] active:translate-y-0 transition-all duration-200"
        >
          <span className="font-label tracking-wide">Acceder al panel</span>
          <ArrowRight
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;
