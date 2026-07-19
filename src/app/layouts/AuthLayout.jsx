import { Outlet, Link } from 'react-router';
import { Eye, ShieldCheck, Zap, Lock } from 'lucide-react';
import logo from '../../assets/logo.png';
import ConstellationBackground from '../../shared/components/feedback/ConstellationBackground.jsx';

const FEATURES = [
  {
    icon: Eye,
    title: 'Detección en vivo',
    description: 'Identificación facial y validación de uniforme cuadro por cuadro.',
  },
  {
    icon: ShieldCheck,
    title: 'Trazabilidad total',
    description: 'Cada incidencia queda registrada con timestamp y evidencia visual.',
  },
  {
    icon: Zap,
    title: 'Respuesta instantánea',
    description: 'Notificaciones automáticas al alumno, coordinación y dirección.',
  },
];

const TICKER_ITEMS = [
  'MONITOREO ACTIVO',
  'ENCRIPTACIÓN AES-256',
  'RED DE CÁMARAS ONLINE',
  'SISTEMA OPERATIVO',
  'CUMPLIMIENTO NORMATIVO',
  'BAJA LATENCIA',
];

const Ticker = () => (
  <div className="ticker-track overflow-hidden whitespace-nowrap">
    <div className="inline-flex animate-marquee gap-10 pr-10">
      {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="font-mono text-[10px] tracking-[0.18em] text-amber-300/70 inline-flex items-center gap-3"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-300/60" aria-hidden />
          {item}
        </span>
      ))}
    </div>
  </div>
);

/* Logo del centinela con radar + anillos concéntricos */
const Centinela = () => (
  <div className="relative w-56 h-56 xl:w-64 xl:h-64 flex items-center justify-center">
    {/* Halo respiratorio amarillo */}
    <div
      className="absolute inset-0 bg-amber-400/20 rounded-full blur-3xl animate-halo-amber"
      aria-hidden
    />
    {/* Anillos concéntricos decorativos */}
    <div className="absolute inset-0 radar-rings" aria-hidden />
    {/* Anillo flotante */}
    <div
      className="absolute inset-3 border border-amber-400/25 rounded-full animate-float-slow"
      aria-hidden
    />
    {/* Radar sweep: semicírculo que rota */}
    <div
      className="absolute inset-0 animate-radar-sweep"
      style={{
        background:
          'conic-gradient(from 0deg, transparent 0deg, rgba(245,197,58,0.18) 30deg, transparent 60deg)',
        borderRadius: '9999px',
        maskImage: 'radial-gradient(circle, black 60%, transparent 62%)',
        WebkitMaskImage: 'radial-gradient(circle, black 60%, transparent 62%)',
      }}
      aria-hidden
    />
    {/* Pulso ring expansivo */}
    <span
      className="absolute inset-8 rounded-full border border-amber-400/30 animate-pulse-ring"
      aria-hidden
    />
    {/* Logo */}
    <img
      src={logo}
      alt="Centinela AI Sentinel"
      className="w-full h-full object-contain relative z-10 animate-boot-up"
      style={{ filter: 'drop-shadow(0 0 22px rgba(245,197,58,0.6))' }}
    />
  </div>
);

const BrandingPanel = () => (
  <aside
    className="hidden lg:flex relative flex-col h-screen col-span-7 overflow-hidden bg-neural noise-overlay"
    aria-label="Panel de marca AI Sentinel"
  >
    <ConstellationBackground seed={7} maxDistance={150} className="opacity-90" />

    {/* Capas decorativas */}
    <div className="absolute inset-0 panel-grid opacity-50 pointer-events-none" aria-hidden />
    <div className="absolute inset-0 branding-glow pointer-events-none" aria-hidden />
    <div
      className="absolute top-1/4 -right-32 w-[420px] h-[420px] rounded-full bg-amber-400/10 blur-[120px] pointer-events-none"
      aria-hidden
    />
    <div
      className="absolute bottom-1/4 -left-32 w-[380px] h-[380px] rounded-full bg-trust/10 blur-[120px] pointer-events-none"
      aria-hidden
    />

    {/* Líneas de circuito decorativas (paths SVG) */}
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
      viewBox="0 0 700 900"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <path
        d="M0 200 L120 200 L150 230 L300 230 L330 200 L450 200"
        stroke="rgba(245,197,58,0.18)"
        strokeWidth="1"
        className="animate-data-stream"
      />
      <path
        d="M700 700 L580 700 L550 670 L400 670 L370 700 L250 700"
        stroke="rgba(245,197,58,0.18)"
        strokeWidth="1"
        className="animate-data-stream"
        style={{ animationDelay: '1.5s' }}
      />
      <path
        d="M0 500 L100 500 L130 530 L260 530"
        stroke="rgba(56,189,248,0.15)"
        strokeWidth="1"
        className="animate-data-stream"
        style={{ animationDelay: '0.7s' }}
      />
      <circle cx="120" cy="200" r="3" fill="rgba(245,197,58,0.6)" />
      <circle cx="450" cy="200" r="3" fill="rgba(245,197,58,0.6)" />
      <circle cx="580" cy="700" r="3" fill="rgba(245,197,58,0.6)" />
      <circle cx="260" cy="530" r="3" fill="rgba(56,189,248,0.6)" />
    </svg>

    <div className="relative z-10 flex-1 flex flex-col justify-center px-12 xl:px-20">
      <div
        className="flex items-center justify-center mb-10 animate-fade-in-up"
        style={{ animationDelay: '60ms' }}
      >
        <Centinela />
      </div>

      <h1
        className="font-display font-extrabold text-on-surface tracking-[-0.04em] leading-[0.95] text-[clamp(2.75rem,5vw,4.5rem)] mb-4 text-center animate-fade-in-up"
        style={{ animationDelay: '180ms' }}
      >
        <span className="wordmark-gradient">AI Sentinel</span>
      </h1>

      <p
        className="text-on-surface-variant text-lg xl:text-xl max-w-md leading-relaxed text-center mx-auto animate-fade-in-up"
        style={{ animationDelay: '300ms' }}
      >
        Observación inteligente del uniforme escolar, en tiempo real.
      </p>

      <div className="mt-12 flex flex-col gap-4 max-w-md mx-auto w-full">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="flex items-start gap-4 group animate-fade-in-up"
              style={{ animationDelay: `${420 + i * 120}ms` }}
            >
              <div className="relative w-10 h-10 shrink-0 flex items-center justify-center rounded-md bg-amber-400/10 border border-amber-400/20 group-hover:border-amber-400/40 transition-colors">
                <Icon className="w-4 h-4 text-amber-300" aria-hidden />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-on-surface font-semibold text-sm">{feature.title}</p>
                <p className="text-on-surface-variant text-xs mt-0.5 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    <div className="relative z-10 pb-8">
      <div className="mx-12 xl:mx-20 h-px divider-amber mb-5" aria-hidden />
      <div className="px-12 xl:px-20">
        <Ticker />
      </div>
      <div className="px-12 xl:px-20 mt-4 flex items-center justify-between font-mono text-[10px] text-on-surface-dim tracking-[0.15em]">
        <span className="inline-flex items-center gap-2">
          <Lock className="w-3 h-3 text-amber-300/80" aria-hidden />
          Cuídamos por ti.
        </span>
        <span>v1.0 Fase Beta</span>
      </div>
    </div>
  </aside>
);

const MobileHeader = () => (
  <header className="lg:hidden relative z-20 p-5 flex items-center justify-center border-b border-white/5">
    <Link to="/" className="flex items-center gap-3" aria-label="AI Sentinel — Inicio">
      <div>
        <p className="font-display text-base font-extrabold text-on-surface tracking-[0.04em] leading-none text-center">
          <span className="wordmark-gradient">AI SENTINEL</span>
        </p>
        <p className="font-label text-[9px] text-amber-300/80 mt-1 text-center">
          Observador de Uniforme
        </p>
      </div>
    </Link>
  </header>
);

const AuthLayout = ({ children }) => {
  return (
    <div className="bg-neural min-h-screen w-full text-on-surface overflow-x-hidden">
      <div className="min-h-screen lg:grid lg:grid-cols-12">
        <BrandingPanel />

        <div className="lg:col-span-5 flex flex-col min-h-screen relative">
          <MobileHeader />

          <main className="relative z-10 flex-1 flex items-center justify-center px-5 sm:px-8 py-10 lg:py-12">
            <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full bg-amber-400/[0.04] blur-[100px] pointer-events-none lg:hidden" />
            <div className="absolute bottom-1/4 -left-20 w-72 h-72 rounded-full bg-trust/[0.05] blur-[100px] pointer-events-none lg:hidden" />
            <div className="w-full max-w-md">{children || <Outlet />}</div>
          </main>

          <footer className="relative z-10 lg:hidden py-5 text-center border-t border-white/5">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] text-on-surface-dim tracking-[0.18em]">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300/80" aria-hidden />
              <span>CONEXIÓN ENCRIPTADA TIER-1</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
