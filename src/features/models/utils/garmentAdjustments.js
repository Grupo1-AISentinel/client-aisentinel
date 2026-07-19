// Persistencia de ajustes manuales por prenda (position/rotation/scale).
// Vive en su propio archivo para que el plugin react-refresh/only-export-components
// no se queje de exportar funciones junto con el componente.

export const KEY_PREFIX = 'aisentinel.garment.adj.';

export const DEFAULT_ADJUSTMENTS = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: 1,
};

export const loadAdjustments = (garmentId) => {
  if (!garmentId) return null;
  try {
    const raw = localStorage.getItem(KEY_PREFIX + garmentId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      position: Array.isArray(parsed.position) ? parsed.position : DEFAULT_ADJUSTMENTS.position,
      rotation: Array.isArray(parsed.rotation) ? parsed.rotation : DEFAULT_ADJUSTMENTS.rotation,
      scale: typeof parsed.scale === 'number' ? parsed.scale : DEFAULT_ADJUSTMENTS.scale,
    };
  } catch {
    return null;
  }
};

export const saveAdjustments = (garmentId, adj) => {
  if (!garmentId) return;
  try {
    localStorage.setItem(KEY_PREFIX + garmentId, JSON.stringify(adj));
  } catch {
    /* ignore quota / serialization */
  }
};

export const clearAdjustments = (garmentId) => {
  if (!garmentId) return;
  try {
    localStorage.removeItem(KEY_PREFIX + garmentId);
  } catch {
    /* ignore */
  }
};
