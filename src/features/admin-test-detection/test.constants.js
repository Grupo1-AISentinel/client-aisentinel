export const MAX_TEST_IMAGES = 10;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const STATUS_BADGE = {
  cumple: { label: 'Cumple', variant: 'success' },
  infraction: { label: 'No cumple', variant: 'error' },
  unknown: { label: 'Desconocido', variant: 'warning' },
  empty: { label: 'Sin detección', variant: 'default' },
};

// FIX: en modo 'clothing' NO consideramos isUnknown (porque el backend
// pone isUnknown=true para TODOS en ese modo). Solo evaluamos la ropa.
// En modo 'full' (default) mantenemos la logica original: desconocido
// se cuenta aparte como 'unknown'.
export const classifyDetection = (detections, mode = 'full') => {
  if (detections.length === 0) return 'empty';
  for (const d of detections) {
    if (mode !== 'clothing' && d.isUnknown) return 'unknown';
    if (d.hasAccessory || d.hasUniform === false) return 'infraction';
  }
  return 'cumple';
};
