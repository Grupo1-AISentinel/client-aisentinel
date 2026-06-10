// Logica compartida de clasificacion y colores para detecciones en vivo.
//
// Misma firma conceptual que classifyDetection de admin-test-detection:
// devuelve uno de 4 estados segun la semantica del uniforme. La usamos
// en dos lugares:
//
//   - LiveBoundingBoxes.jsx  -> color del bbox + badge SI/?/NO
//   - DetectionOverlay.jsx   -> borde del panel + texto del estado
//
// Cuatro estados:
//   - comply:    uniforme completo, conocido (verde)
//   - partial:   uniforme parcial, conocido (amarillo)
//   - unknown:   persona no registrada (naranja)
//   - infraction: conocido sin uniforme o con accesorio (rojo)
//
// La fuente de verdad sigue siendo la deteccion de pyimage (hasUniform,
// hasAccessory, isUnknown, clothingDetails). Si la deteccion llega con
// clothingDetails tipo "Sin Pantalon Visible" o "requiere camisa oficial",
// se considera parcial aunque hasUniform=true (caso chumpa cerrada
// oficial pero sin pantalon visible, o chumpa abierta sin camisa
// oficial debajo).

export const DETECTION_STATES = {
  COMPLY: 'comply',
  PARTIAL: 'partial',
  UNKNOWN: 'unknown',
  INFRACTION: 'infraction',
};

// Color de stroke del bbox (CSS var) por estado. Usamos las mismas vars
// que el resto del sistema de diseno (definidas en index.css).
export const STROKE_BY_STATE = {
  comply: 'var(--color-state-success)',
  partial: 'var(--color-state-warning)',
  unknown: 'var(--color-state-warning)',
  infraction: 'var(--color-state-error)',
};

// Para accesorio especifico (morado). Lo separamos del rojo de infraccion
// porque semanticamente "accesorio" no es lo mismo que "no uniforme".
export const ACCESORY_STROKE = 'var(--color-state-accesory, #b45cd6)';

export const STATE_LABEL = {
  comply: 'Cumple',
  partial: 'Parcial',
  unknown: 'Sin identificar',
  infraction: 'No cumple',
};

// Texto corto que va en el badge pegado al nombre del bbox.
export const STATE_BADGE_TEXT = {
  comply: 'SI',
  partial: '?',
  unknown: '?',
  infraction: 'NO',
};

// Variante del componente Badge (compartido en shared/components/ui).
export const STATE_BADGE_VARIANT = {
  comply: 'success',
  partial: 'warning',
  unknown: 'warning',
  infraction: 'error',
};

const PARTIAL_KEYWORDS = ['sin pantalon', 'sin camisa', 'requiere camisa', 'no de cat', 'faltante'];

const isPartialDetails = (clothingDetails) => {
  if (!clothingDetails || typeof clothingDetails !== 'string') return false;
  const lower = clothingDetails.toLowerCase();
  return PARTIAL_KEYWORDS.some((kw) => lower.includes(kw));
};

// classifyStudent(student) -> 'comply' | 'partial' | 'unknown' | 'infraction'
// Replica la semantica de classifyDetection en test.constants.js pero
// resuelve a 4 estados en vez de los 3 que el test usa (empty/cumple/...).
export const classifyStudent = (student) => {
  if (!student) return DETECTION_STATES.UNKNOWN;
  if (student.isUnknown) return DETECTION_STATES.UNKNOWN;
  if (student.hasAccessory) return DETECTION_STATES.INFRACTION;
  if (student.hasUniform === false) return DETECTION_STATES.INFRACTION;
  if (student.hasUniform === true && isPartialDetails(student.clothingDetails)) {
    return DETECTION_STATES.PARTIAL;
  }
  return DETECTION_STATES.COMPLY;
};

// Label que se muestra al lado del bbox. En monitoreo siempre mostramos
// el nombre real del estudiante (no hay modo clothing). Si es
// desconocido, devolvemos 'Desconocido'.
export const studentLabel = (student) => {
  if (!student) return 'Detectado';
  if (student.isUnknown) return 'Desconocido';
  return student.studentName || student.studentCard || student.fullName || 'Detectado';
};

// Color del bbox de ROPA segun si la prenda es valida o no.
// Distinto del color de la cara (que se basa en el estado global).
export const clothingStroke = (valid) =>
  valid ? 'var(--color-state-success)' : 'var(--color-state-error)';
