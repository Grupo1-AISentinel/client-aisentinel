import { useEffect, useState } from 'react';
import { Clock, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/index.js';

const IdleWarningModal = ({ open, countdownSeconds, onContinue, onLogoutNow }) => {
  const [remaining, setRemaining] = useState(countdownSeconds);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRemaining(countdownSeconds);
      return undefined;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(countdownSeconds);
    const interval = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [open, countdownSeconds]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="idle-modal-title"
      aria-describedby="idle-modal-desc"
      style={{ background: 'rgba(0, 0, 0, 0.72)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-slide-up"
        style={{
          background: 'var(--color-surface-bright)',
          border: '1px solid var(--color-outline-soft)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
        }}
      >
        <div className="p-6 flex flex-col items-center text-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(245, 197, 58, 0.12)',
              border: '1px solid rgba(245, 197, 58, 0.35)',
            }}
          >
            <Clock className="w-7 h-7 text-amber-300" aria-hidden />
          </div>

          <h2
            id="idle-modal-title"
            className="font-display text-xl font-semibold text-on-surface tracking-tight"
          >
            ¿Sigues ahí?
          </h2>

          <p id="idle-modal-desc" className="text-sm text-on-surface-variant leading-relaxed">
            Detectamos inactividad en tu sesión. Por seguridad, cerraremos la sesión automáticamente
            si no confirmas que continúas.
          </p>

          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className="font-mono text-4xl font-bold tabular-nums"
              style={{ color: 'var(--color-amber-300, #f5c53a)' }}
              aria-live="polite"
            >
              {remaining}
            </span>
            <span className="text-sm text-on-surface-variant">segundos</span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono tracking-wider text-on-surface-variant/80">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            CIERRE AUTOMÁTICO POR INACTIVIDAD
          </div>
        </div>

        <div
          className="flex items-center gap-2 p-4 border-t"
          style={{ borderColor: 'var(--color-outline-soft)' }}
        >
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={onLogoutNow}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Cerrar sesión
          </Button>
          <Button variant="primary" size="md" fullWidth onClick={onContinue}>
            Seguir activo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IdleWarningModal;
