import { useState } from 'react';
import { Shirt, Plus, X, Sparkles, User, Footprints, Watch, Box } from 'lucide-react';
import useModels3DStore, { SLOT_LABELS, SLOT_ORDER } from '../stores/models3dStore.js';
import { cn } from '../../../shared/utils/cn.js';
import BindingFallback from './BindingFallback.jsx';

const SLOT_ICONS = {
  body: User,
  upper: Shirt,
  lower: Footprints,
  outerwear: Shirt,
  accessory: Watch,
};

const SLOT_GRADIENTS = {
  body: 'from-tertiary/20 to-primary/10',
  upper: 'from-amber-400/20 to-warning/5',
  lower: 'from-info/20 to-tertiary/5',
  outerwear: 'from-warning/20 to-error/5',
  accessory: 'from-success/20 to-tertiary/5',
};

/**
 * Thumbnail de prenda sin render 3D en hover (causaba Context Lost
 * con 4+ previews). Ahora es un gradiente + icono de slot, lo que
 * reduce el uso de WebGL contexts de N+1 a 1.
 */
const GarmentThumb = ({ garment, active, gradient, hasIssue }) => {
  const Icon = SLOT_ICONS[garment.slot || garment.role] || Box;

  if (hasIssue) {
    return <BindingFallback garment={garment} />;
  }

  return (
    <div
      className={cn(
        'w-full h-full grid place-items-center bg-gradient-to-br',
        gradient || 'from-amber-400/20 to-tertiary/5'
      )}
    >
      <Icon
        className={cn(
          'w-7 h-7 transition-transform duration-200',
          active ? 'text-amber-300 scale-110' : 'text-on-surface-variant/60'
        )}
      />
    </div>
  );
};

const SlotSection = ({ slot, label, garments, activeId, issues, onToggle, onClear, onUpload }) => {
  const Icon = SLOT_ICONS[slot] || Shirt;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-400/15 grid place-items-center">
            <Icon className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
            {label}
          </span>
          {activeId && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse"
              aria-label="slot activo"
            />
          )}
          <span className="font-label text-[9px] text-on-surface-dim">
            {garments.length} {garments.length === 1 ? 'pieza' : 'piezas'}
          </span>
        </div>
        {activeId && (
          <button
            type="button"
            onClick={() => onClear(slot)}
            className="p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
            title="Quitar prenda de este slot"
            aria-label={`Quitar prenda de ${label}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {garments.length === 0 ? (
          <button
            type="button"
            onClick={() => onUpload(slot)}
            className="col-span-3 flex items-center justify-center gap-2 p-3 rounded-md border-2 border-dashed border-white/10 text-on-surface-variant hover:border-amber-400 hover:text-amber-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="font-label text-[10px] uppercase">Subir primera prenda</span>
          </button>
        ) : (
          <>
            {garments.map((g) => {
              const isActive = activeId === g.id;
              const hasIssue = issues?.some((i) => i.id === g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onToggle(slot, g.id)}
                  className={cn(
                    'group relative aspect-square rounded-md border overflow-hidden transition-all duration-200',
                    isActive
                      ? 'border-amber-400 shadow-[0_0_18px_rgba(245,197,58,0.45)] ring-1 ring-amber-400/50'
                      : 'border-white/10 hover:border-amber-400/50 hover:shadow-[0_0_10px_rgba(245,197,58,0.18)]'
                  )}
                  title={g.displayName || g.name}
                >
                  <GarmentThumb
                    garment={g}
                    active={isActive}
                    gradient={SLOT_GRADIENTS[g.slot || slot]}
                    hasIssue={hasIssue}
                  />
                  <div className="absolute inset-x-0 bottom-0 px-1.5 py-1 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                    <p className="text-[9px] font-label text-on-surface truncate uppercase tracking-wider">
                      {g.displayName || g.name}
                    </p>
                  </div>
                  {g.era && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-amber-300 text-[8px] font-mono">
                      {g.era}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,197,58,0.8)]" />
                  )}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onUpload(slot)}
              className="aspect-square rounded-md border-2 border-dashed border-white/10 text-on-surface-variant hover:border-amber-400 hover:text-amber-300 transition-colors grid place-items-center"
              title={`Subir prenda para ${label}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const SlotPanel = ({ onUpload, issues }) => {
  const getGarmentsBySlot = useModels3DStore((s) => s.getGarmentsBySlot);
  const activeGarments = useModels3DStore((s) => s.activeGarments);
  const toggleGarmentInSlot = useModels3DStore((s) => s.toggleGarmentInSlot);
  const clearSlot = useModels3DStore((s) => s.clearSlot);

  const grouped = getGarmentsBySlot();

  return (
    <div className="flex flex-col gap-5 p-4 bg-surface-container-lowest/40 border border-white/5 rounded-2xl h-full overflow-y-auto">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-base text-on-surface flex items-center gap-2">
            <Shirt className="w-4 h-4 text-amber-300" />
            Personalizar uniforme
          </h3>
          <p className="font-label text-[10px] text-on-surface-variant mt-1">
            Click en una prenda para ponerla. Click de nuevo para quitarla.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-400/10 border border-amber-400/20">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span className="font-label text-[9px] text-amber-300 uppercase">Modular</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {SLOT_ORDER.map((slot) => (
          <SlotSection
            key={slot}
            slot={slot}
            label={SLOT_LABELS[slot]}
            garments={grouped[slot] || []}
            activeId={activeGarments[slot] || null}
            issues={issues}
            onToggle={toggleGarmentInSlot}
            onClear={clearSlot}
            onUpload={onUpload}
          />
        ))}
      </div>
    </div>
  );
};

export default SlotPanel;
