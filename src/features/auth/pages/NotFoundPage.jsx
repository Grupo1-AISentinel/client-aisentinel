import { Link } from 'react-router';
import { ArrowRight, Compass } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col items-center text-center gap-6">
        <div
          className="w-16 h-16 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center animate-boot-up"
          aria-hidden
        >
          <Compass className="w-8 h-8 text-amber-300" />
        </div>

        <header className="flex flex-col gap-3">
          <span className="font-mono text-[10px] tracking-[0.22em] text-amber-300/80 inline-flex items-center gap-2 justify-center">
            <span className="inline-block w-6 h-px bg-amber-300/60" aria-hidden />
            RUTA NO ENCONTRADA
          </span>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-extrabold text-on-surface tracking-[-0.04em] leading-none">
            <span className="wordmark-gradient">404</span>
          </h1>
          <h2 className="font-display text-xl font-semibold text-on-surface mt-2">
            Página no encontrada
          </h2>
          <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-sm">
            La ruta que buscas no existe o fue movida dentro del Sentinel.
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

export default NotFoundPage;
