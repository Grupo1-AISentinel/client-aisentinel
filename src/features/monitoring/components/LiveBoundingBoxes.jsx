import { memo } from 'react';
import { useDetectionStore } from '../stores/detectionStore.js';
import { scaleBox, scaleRect } from '../utils/scaleBox.js';
import {
  classifyStudent,
  studentLabel,
  STROKE_BY_STATE,
  STATE_BADGE_TEXT,
  ACCESORY_STROKE,
  clothingStroke,
} from '../utils/detectionColors.js';

// Visual IDENTICO al BboxOverlay de admin-test-detection pero aplicado
// al video stream en vivo. Mismos 4 estados semanticos (cumple/parcial/
// desconocido/infraccion), mismo badge SI/?/NO, misma escala adaptativa,
// mismo outline negro + fondo semitransparente.
//
// Diferencia clave con test-detection: aqui NO renderizamos Canny/edges
// porque seria muy caro pintar pixel-a-pixel en SVG sobre un <video>.
// Solo el bbox con su badge.

// Etiqueta compacta "Nombre + badge" sobre el bbox de la cara.
// El badge es un rect pequeno con texto corto (SI/?/NO) al lado del nombre.
// Ambos comparten un fondo con outline negro para legibilidad sobre
// cualquier frame del video.
const FaceLabel = ({ name, badgeText, x, y, color, viewW }) => {
  const fontSize = Math.max(10, viewW * 0.011);
  // Ancho del nombre: aprox 0.55 * fontsize por caracter mono. 8 chars
  // minimo para que el badge tenga espacio.
  const nameW = Math.max(80, name.length * fontSize * 0.6 + 16);
  const badgeW = Math.max(28, badgeText.length * fontSize * 0.7 + 14);
  const totalW = nameW + badgeW + 6;
  const labelH = fontSize * 1.7;
  const labelY = Math.max(0, y - labelH - 4);
  return (
    <g>
      {/* Fondo del label completo (nombre + badge) */}
      <rect
        x={x}
        y={labelY}
        rx={4}
        ry={4}
        width={totalW}
        height={labelH}
        fill="var(--color-surface-overlay)"
        opacity="0.92"
        stroke="rgba(0,0,0,0.85)"
        strokeWidth="1.5"
      />
      {/* Texto del nombre (color semantico) */}
      <text
        x={x + 8}
        y={labelY + labelH * 0.7}
        fill={color}
        fontSize={fontSize}
        fontFamily="monospace"
        fontWeight="bold"
        style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.95))' }}
      >
        {name}
      </text>
      {/* Separador vertical entre nombre y badge */}
      <line
        x1={x + nameW + 3}
        y1={labelY + 4}
        x2={x + nameW + 3}
        y2={labelY + labelH - 4}
        stroke="rgba(0,0,0,0.5)"
        strokeWidth="1"
      />
      {/* Badge SI/?/NO con el mismo color semantico */}
      <rect
        x={x + nameW + 6}
        y={labelY + 2}
        rx={3}
        ry={3}
        width={badgeW}
        height={labelH - 4}
        fill={color}
        opacity="0.92"
        stroke="rgba(0,0,0,0.85)"
        strokeWidth="1.5"
      />
      <text
        x={x + nameW + 6 + badgeW / 2}
        y={labelY + labelH * 0.7}
        fill="#0a0a0a"
        fontSize={fontSize}
        fontFamily="monospace"
        fontWeight="bold"
        textAnchor="middle"
        style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.6))' }}
      >
        {badgeText}
      </text>
    </g>
  );
};

const LiveBoundingBoxes = ({ cameraId, renderSize, videoSize }) => {
  // FIX: pinto directo del liveFrame (estudiantes de pyimage) sin pasar
  // por el tracker Kalman. Razon: el tracker introducia ruido que ponia
  // los bboxes en el centro cuando la velocidad se desvanecía. Mejor
  // pintar lo que pyimage detecta, sin filtro intermedio.
  const students = useDetectionStore((s) => s.liveDetections[cameraId]?.students) || [];

  if (!videoSize) return null;
  const safeRenderSize = renderSize?.width > 0 ? renderSize : { width: 640, height: 480 };
  const viewW = safeRenderSize.width;
  const viewH = safeRenderSize.height;

  // strokeWidth adaptativo: igual patron que test-detection BboxOverlay
  // (imageSize.width / 320). Garantiza consistencia visual entre el
  // test estatico y el monitoreo en vivo.
  const faceStrokeWidth = Math.max(2, viewW / 320);
  const clothingStrokeWidth = Math.max(1.5, viewW / 480);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${viewW} ${viewH}`}
      preserveAspectRatio="none"
    >
      {students.map((student, idx) => {
        const state = classifyStudent(student);
        // accesorio tiene color propio (morado) independiente del estado
        // general, para que se distinga visualmente de "no uniforme".
        const color = student.hasAccessory ? ACCESORY_STROKE : STROKE_BY_STATE[state];
        const scaledFace = scaleBox(student.faceBox, videoSize, safeRenderSize);

        // Fallback para faceBox degenerado (cubre toda la imagen o es
        // <10px). pyimage retorna esto cuando el frame viene vacio o la
        // deteccion fallo. Pintamos un cuadrado dashed centrado para
        // mantener el indicador visible, sin el texto literal de debug
        // que tenia la version anterior.
        const isDegenerateFace =
          scaledFace &&
          ((scaledFace.width >= viewW - 4 && scaledFace.height >= viewH - 4) ||
            scaledFace.width < 10 ||
            scaledFace.height < 10);
        const fallbackSize = Math.min(120, viewW * 0.25, viewH * 0.25);
        const fallbackX = (viewW - fallbackSize) / 2;
        const fallbackY = (viewH - fallbackSize) / 2;
        const useFallback = !scaledFace || isDegenerateFace;

        const name = studentLabel(student);
        const badgeText = STATE_BADGE_TEXT[state];
        const key = `${student.studentCard || 'u'}-${idx}`;

        return (
          <g key={key}>
            {useFallback ? (
              <>
                <rect
                  x={fallbackX}
                  y={fallbackY}
                  width={fallbackSize}
                  height={fallbackSize}
                  fill="none"
                  stroke={color}
                  strokeWidth={faceStrokeWidth}
                  strokeDasharray="6 4"
                  rx="6"
                  style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                />
                <FaceLabel
                  name={name}
                  badgeText={badgeText}
                  x={fallbackX}
                  y={fallbackY}
                  color={color}
                  viewW={viewW}
                />
              </>
            ) : (
              <>
                <rect
                  x={scaledFace.x}
                  y={scaledFace.y}
                  width={scaledFace.width}
                  height={scaledFace.height}
                  fill="none"
                  stroke={color}
                  strokeWidth={faceStrokeWidth}
                  rx={Math.max(4, viewW / 240)}
                  style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                />
                <FaceLabel
                  name={name}
                  badgeText={badgeText}
                  x={scaledFace.x}
                  y={scaledFace.y}
                  color={color}
                  viewW={viewW}
                />
              </>
            )}

            {/* Bboxes de ropa: cada prenda se dibuja con su color
                semantico (verde si valida, rojo si no). Mismo patron
                que BboxOverlay de test-detection. */}
            {(student.clothingBoxes || []).map((cb, i) => {
              if (!cb.box) return null;
              const scaled = scaleRect(cb.box, videoSize, safeRenderSize);
              if (!scaled) return null;
              const cbColor = clothingStroke(cb.valid);
              const fontSize = Math.max(8, viewW * 0.0085);
              return (
                <g key={`cl-${idx}-${i}`}>
                  <rect
                    x={scaled.x}
                    y={scaled.y}
                    width={scaled.width}
                    height={scaled.height}
                    fill="none"
                    stroke={cbColor}
                    strokeWidth={clothingStrokeWidth}
                    strokeDasharray={`${viewW * 0.012} ${viewW * 0.006}`}
                    rx={3}
                    opacity="0.9"
                    style={{ filter: `drop-shadow(0 0 3px ${cbColor})` }}
                  />
                  <text
                    x={scaled.x}
                    y={scaled.y + scaled.height + fontSize * 1.3}
                    fill={cbColor}
                    fontSize={fontSize}
                    fontFamily="monospace"
                    fontWeight="bold"
                    style={{
                      filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.95))',
                    }}
                  >
                    {(cb.class || '').toUpperCase()}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
};

export default memo(LiveBoundingBoxes);
