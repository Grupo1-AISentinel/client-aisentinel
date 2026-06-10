import { useState } from 'react';
import { Move, RotateCw, Maximize2, RotateCcw } from 'lucide-react';
import { Card } from '../../../shared/components/ui/index.js';
import { cn } from '../../../shared/utils/cn.js';
import {
  DEFAULT_ADJUSTMENTS,
  loadAdjustments,
  saveAdjustments,
} from '../utils/garmentAdjustments.js';

const SLIDER =
  'w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-secondary';

const TransformRow = ({ label, value, min, max, step, onChange, unit = '', disabled }) => (
  <div className="flex items-center gap-2">
    <span className="w-12 font-label text-[9px] uppercase text-on-surface-dim">{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={cn(SLIDER, disabled && 'opacity-40 cursor-not-allowed')}
    />
    <span className="w-14 text-right font-mono text-[10px] text-on-surface">
      {value.toFixed(2)}
      {unit}
    </span>
  </div>
);

// Panel de ajuste manual para prendas que no se deforman con el rig.
// Expone sliders de posicion/rotacion/escala que se persisten en
// localStorage por (garmentId) y se aplican en el UniformViewer.
const ManualFitPanel = ({ garments, slotTransforms, onAdjustmentsChange }) => {
  const [selectedId, setSelectedId] = useState(garments[0]?.id || null);
  const selected = garments.find((g) => g.id === selectedId);
  const slotBaseAdj = selected ? slotTransforms[selected.role] || DEFAULT_ADJUSTMENTS : null;
  const [adj, setAdj] = useState(slotBaseAdj || DEFAULT_ADJUSTMENTS);

  // Cuando cambia el garment seleccionado, cargar su ajuste
  const handleSelect = (id) => {
    setSelectedId(id);
    const g = garments.find((x) => x.id === id);
    const slotBase = g ? slotTransforms[g.role] || DEFAULT_ADJUSTMENTS : null;
    const storedForNew = loadAdjustments(id);
    setAdj(storedForNew || slotBase || DEFAULT_ADJUSTMENTS);
  };

  if (garments.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-xs text-on-surface-dim text-center">
          Activa una prenda para ajustar su posición manualmente.
        </p>
      </Card>
    );
  }

  const update = (axis, idx, value) => {
    setAdj((prev) => {
      const next = [...prev[axis]];
      next[idx] = value;
      const out = { ...prev, [axis]: next };
      if (selected) {
        saveAdjustments(selected.id, out);
        onAdjustmentsChange?.(selected.id, out);
      }
      return out;
    });
  };

  const updateScale = (value) => {
    setAdj((prev) => {
      const out = { ...prev, scale: value };
      if (selected) {
        saveAdjustments(selected.id, out);
        onAdjustmentsChange?.(selected.id, out);
      }
      return out;
    });
  };

  const reset = () => {
    const base = slotBaseAdj || DEFAULT_ADJUSTMENTS;
    setAdj(base);
    if (selected) {
      saveAdjustments(selected.id, base);
      onAdjustmentsChange?.(selected.id, base);
    }
  };

  return (
    <Card className="p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-secondary" />
          <h3 className="font-display text-sm text-on-surface">Ajuste manual</h3>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-on-surface-variant hover:text-on-surface text-[10px] font-label"
          title="Restablecer a posición por defecto"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        {garments.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => handleSelect(g.id)}
            className={cn(
              'px-2 py-0.5 rounded text-[10px] font-label transition-colors',
              selectedId === g.id
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-white/5 text-on-surface-variant hover:bg-white/10 border border-transparent'
            )}
          >
            {g.displayName || g.name}
          </button>
        ))}
      </div>

      {selected && (
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-[10px] font-label uppercase text-on-surface-variant">
            <Move className="w-3 h-3" /> Posición
          </div>
          <TransformRow
            label="X"
            value={adj.position[0]}
            min={-2}
            max={2}
            step={0.01}
            onChange={(v) => update('position', 0, v)}
          />
          <TransformRow
            label="Y"
            value={adj.position[1]}
            min={-2}
            max={2}
            step={0.01}
            onChange={(v) => update('position', 1, v)}
          />
          <TransformRow
            label="Z"
            value={adj.position[2]}
            min={-2}
            max={2}
            step={0.01}
            onChange={(v) => update('position', 2, v)}
          />

          <div className="flex items-center gap-1.5 text-[10px] font-label uppercase text-on-surface-variant mt-1">
            <RotateCw className="w-3 h-3" /> Rotación
          </div>
          <TransformRow
            label="X"
            value={(adj.rotation[0] * 180) / Math.PI}
            min={-180}
            max={180}
            step={1}
            unit="°"
            onChange={(v) => update('rotation', 0, (v * Math.PI) / 180)}
          />
          <TransformRow
            label="Y"
            value={(adj.rotation[1] * 180) / Math.PI}
            min={-180}
            max={180}
            step={1}
            unit="°"
            onChange={(v) => update('rotation', 1, (v * Math.PI) / 180)}
          />
          <TransformRow
            label="Z"
            value={(adj.rotation[2] * 180) / Math.PI}
            min={-180}
            max={180}
            step={1}
            unit="°"
            onChange={(v) => update('rotation', 2, (v * Math.PI) / 180)}
          />

          <div className="flex items-center gap-1.5 text-[10px] font-label uppercase text-on-surface-variant mt-1">
            <Maximize2 className="w-3 h-3" /> Escala
          </div>
          <TransformRow
            label="S"
            value={adj.scale}
            min={0.5}
            max={2}
            step={0.01}
            onChange={updateScale}
          />
        </div>
      )}
    </Card>
  );
};

export default ManualFitPanel;
