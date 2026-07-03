import { memo, useEffect, useState } from 'react';
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

// Duracion de la interpolacion de posicion. Debe aproximarse a la
// cadencia de analisis (FRAME_INTERVAL_MS del uploader) para que el
// box se deslice de forma continua entre una deteccion y la siguiente
// en vez de teletransportarse.
const TRANSITION_MS = 170;
// Sin detecciones frescas en este lapso, el overlay se desvanece: un
// box dibujado donde la persona estuvo hace segundos es peor que
// ninguno (el uploader pudo entrar en backoff o la escena cambio).
const STALE_MS = 3000;

// Etiqueta compacta "Nombre + badge" sobre el bbox de la cara.
// El badge es un rect pequeno con texto corto (SI/?/NO) al lado del nombre.
// Ambos comparten un fondo con outline negro para legibilidad sobre
// cualquier frame del video.
// Coordenadas RELATIVAS al grupo del bbox (que se posiciona con un
// transform animado); faceY absoluto solo decide el clamp superior.
const FaceLabel = ({ name, badgeText, faceY, color, viewW }) => {
  const fontSize = Math.max(10, viewW * 0.011);
  // Ancho del nombre: aprox 0.55 * fontsize por caracter mono. 8 chars
  // minimo para que el badge tenga espacio.
  const nameW = Math.max(80, name.length * fontSize * 0.6 + 16);
  const badgeW = Math.max(28, badgeText.length * fontSize * 0.7 + 14);
  const totalW = nameW + badgeW + 6;
  const labelH = fontSize * 1.7;
  const x = 0;
  // Equivale al clamp absoluto Math.max(0, faceY - labelH - 4) de antes.
  const labelY = Math.max(-faceY, -(labelH + 4));
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
  // pintar lo que pyimage detecta, sin filtro intermedio. La fluidez la
  // aporta la transicion CSS del transform de cada grupo (TRANSITION_MS).
  const liveFrame = useDetectionStore((s) => s.liveDetections[cameraId]);
  const students = liveFrame?.students || [];
  const receivedAt = liveFrame?._receivedAt || 0;

  // Tick de 1s solo para evaluar caducidad; el resto de renders los
  // dispara el propio store con cada live_frame.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!students.length) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [students.length]);
  const isStale = receivedAt > 0 && now - receivedAt > STALE_MS;

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
      style={{ opacity: isStale ? 0 : 1, transition: 'opacity 600ms ease-out' }}
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
        const hasFiniteFace =
          scaledFace &&
          Number.isFinite(scaledFace.x) &&
          Number.isFinite(scaledFace.y) &&
          Number.isFinite(scaledFace.width) &&
          Number.isFinite(scaledFace.height);
        const isDegenerateFace =
          scaledFace &&
          (!hasFiniteFace ||
            (scaledFace.width >= viewW - 4 && scaledFace.height >= viewH - 4) ||
            scaledFace.width < 10 ||
            scaledFace.height < 10);
        const fallbackSize = Math.min(120, viewW * 0.25, viewH * 0.25);
        const fallbackX = (viewW - fallbackSize) / 2;
        const fallbackY = (viewH - fallbackSize) / 2;
        const useFallback = !scaledFace || isDegenerateFace;

        const name = studentLabel(student);
        const badgeText = STATE_BADGE_TEXT[state];
        const key = `${student.studentCard || 'u'}-${idx}`;

        // Posicion del grupo del bbox facial. El grupo entero (rect +
        // label) se mueve con transition sobre transform: entre una
        // deteccion y la siguiente el box se DESLIZA hacia la nueva
        // posicion en vez de saltar — la clave de la fluidez percibida.
        const faceX = useFallback ? fallbackX : scaledFace.x;
        const faceY = useFallback ? fallbackY : scaledFace.y;
        const faceW = useFallback ? fallbackSize : scaledFace.width;
        const faceH = useFallback ? fallbackSize : scaledFace.height;
        const glide = {
          transform: `translate(${faceX}px, ${faceY}px)`,
          transition: `transform ${TRANSITION_MS}ms linear`,
        };

        return (
          <g key={key}>
            <g style={glide}>
              <rect
                x={0}
                y={0}
                width={faceW}
                height={faceH}
                fill="none"
                stroke={color}
                strokeWidth={faceStrokeWidth}
                strokeDasharray={useFallback ? '6 4' : undefined}
                rx={useFallback ? 6 : Math.max(4, viewW / 240)}
                style={{
                  filter: `drop-shadow(0 0 ${useFallback ? 6 : 4}px ${color})`,
                  transition: `width ${TRANSITION_MS}ms linear, height ${TRANSITION_MS}ms linear`,
                }}
              />
              <FaceLabel
                name={name}
                badgeText={badgeText}
                faceY={faceY}
                color={color}
                viewW={viewW}
              />
            </g>

            {/* Bboxes de ropa: cada prenda se dibuja con su color
                semantico (verde si valida, rojo si no). Mismo patron
                que BboxOverlay de test-detection. */}
            {(student.clothingBoxes || []).map((cb, i) => {
              if (!cb.box) return null;
              const scaled = scaleRect(cb.box, videoSize, safeRenderSize);
              if (
                !scaled ||
                !Number.isFinite(scaled.x) ||
                !Number.isFinite(scaled.y) ||
                !Number.isFinite(scaled.width) ||
                !Number.isFinite(scaled.height)
              )
                return null;
              const cbColor = clothingStroke(cb.valid);
              const fontSize = Math.max(8, viewW * 0.0085);
              return (
                <g
                  key={`cl-${idx}-${i}`}
                  style={{
                    transform: `translate(${scaled.x}px, ${scaled.y}px)`,
                    transition: `transform ${TRANSITION_MS}ms linear`,
                  }}
                >
                  <rect
                    x={0}
                    y={0}
                    width={scaled.width}
                    height={scaled.height}
                    fill="none"
                    stroke={cbColor}
                    strokeWidth={clothingStrokeWidth}
                    strokeDasharray={`${viewW * 0.012} ${viewW * 0.006}`}
                    rx={3}
                    opacity="0.9"
                    style={{
                      filter: `drop-shadow(0 0 3px ${cbColor})`,
                      transition: `width ${TRANSITION_MS}ms linear, height ${TRANSITION_MS}ms linear`,
                    }}
                  />
                  <text
                    x={0}
                    y={scaled.height + fontSize * 1.3}
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
