import { Box, AlertTriangle } from 'lucide-react';
import { cn } from '../../../shared/utils/cn.js';

const SLOT_COLORS = {
  upper: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  lower: 'border-info/30 bg-info/10 text-info',
  outerwear: 'border-warning/30 bg-warning/10 text-warning-bright',
  accessory: 'border-success/30 bg-success/10 text-success-bright',
  body: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
};

const SLOT_LABELS = {
  upper: 'TORSO',
  lower: 'PIERNAS',
  outerwear: 'OUTERWEAR',
  accessory: 'ACCESORIO',
  body: 'CUERPO',
};

/**
 * Placeholder visual cuando una prenda no se puede bindear al esqueleto.
 * En lugar de ocultarla, la mostramos como una caja coloreada con un
 * chip "BIND FALLBACK" para que el usuario sepa que hay un problema
 * con el GLB (rig no compatible) sin perder la composición.
 */
const BindingFallback = ({ garment, reason, className }) => {
  const slot = garment?.slot || garment?.role || 'upper';
  const colorClass = SLOT_COLORS[slot] || SLOT_COLORS.upper;
  return (
    <div
      className={cn(
        'relative aspect-square rounded-md border-2 border-dashed grid place-items-center overflow-hidden',
        colorClass,
        className
      )}
      title={`No se pudo bindear: ${garment?.displayName || garment?.name || 'prenda'}`}
    >
      <Box className="w-7 h-7 opacity-70" aria-hidden />
      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 font-mono text-[8px] uppercase tracking-wider text-on-surface">
        {SLOT_LABELS[slot]}
      </span>
      <span className="absolute bottom-1 inset-x-1 px-1 py-0.5 rounded bg-error/20 border border-error/30 font-mono text-[8px] uppercase tracking-wider text-error-bright text-center flex items-center justify-center gap-1">
        <AlertTriangle className="w-2.5 h-2.5" />
        BIND
      </span>
    </div>
  );
};

export default BindingFallback;
