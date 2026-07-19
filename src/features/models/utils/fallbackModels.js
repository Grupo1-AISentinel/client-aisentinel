/**
 * fallbackModels.js
 *
 * Registro central de modelos fallback. Cuando un GLB real falla al
 * cargar o al bindear, el cliente usa el fallback correspondiente a su
 * slot. Los fallbacks son cajas simples generadas por
 * scripts/generate-fallback-models.mjs.
 *
 * Mantener este archivo sincronizado con la lista de PRESETS del script.
 */

export const FALLBACK_MODEL_PATHS = {
  upper: '/three/fallback/upper_fallback.glb',
  lower: '/three/fallback/lower_fallback.glb',
  outerwear: '/three/fallback/outerwear_fallback.glb',
  body: null, // body nunca debe tener fallback: si humanoid.glb falla, no hay nada que renderear
  accessory: '/three/fallback/upper_fallback.glb', // reusamos upper como proxy
};

/**
 * Devuelve el path fallback para un slot, o null si no hay.
 */
export const getFallbackForSlot = (slot) => FALLBACK_MODEL_PATHS[slot] || null;

/**
 * Devuelve el path real, o el fallback si el real falla.
 * Usado por el viewer antes de cargar un GLB.
 */
export const resolveModelPath = (garment) => {
  if (!garment) return null;
  if (garment.path) return garment.path;
  return getFallbackForSlot(garment.slot || garment.role);
};
