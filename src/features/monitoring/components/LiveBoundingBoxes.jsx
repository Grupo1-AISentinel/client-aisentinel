import { memo, useEffect, useMemo, useRef } from 'react';
import { useDetectionStore } from '../stores/detectionStore.js';
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
// desconocido/infraccion), mismo badge SI/?/NO, mismo outline negro +
// fondo semitransparente.
//
// ----------------------------------------------------------------------
// ALINEACION CON EL VIDEO (object-cover)
// ----------------------------------------------------------------------
// El <video> del monitoreo usa `object-cover`: escala el frame para LLENAR
// el contenedor (aspecto uniforme, RECORTA el eje sobrante). Un video
// vertical (p.ej. 1080x1920 de un celular) en un tile 16:9 se recorta
// arriba/abajo. Antes el overlay SVG usaba `preserveAspectRatio="none"`
// (estira ambos ejes al contenedor) y escalaba los boxes con sx/sy
// independientes -> los boxes quedaban comprimidos y desfasados (la cara
// caia en la frente, la ropa fuera del cuerpo).
//
// FIX: el SVG dibuja en COORDENADAS DEL VIDEO (viewBox = tamano del frame
// analizado) con `preserveAspectRatio="xMidYMid slice"`. `slice` aplica el
// MISMO transform que `object-cover` (escala por el mayor factor y recorta),
// asi que cada box en coordenadas del frame cae exactamente sobre la persona
// que se ve, sin importar el aspecto del contenedor. No hay que escalar a
// pixeles de render: el navegador hace la transformacion.
//
// Diferencia con test-detection: aqui NO renderizamos Canny/edges (seria
// muy caro pintar pixel-a-pixel en SVG sobre un <video>). Solo el bbox.
//
// ----------------------------------------------------------------------
// SINCRONIZACION WEB == LOCAL (PromtV3)
// ----------------------------------------------------------------------
// El motor Python local dibuja el box sobre el MISMO frame que analizo. En
// la web el <video> avanza continuo mientras la deteccion llega ~80-250ms
// tarde. Proyectamos cada box hacia adelante por el tiempo desde la captura
// usando la velocidad estimada, y DESLIZAMOS (glide) suave entre detecciones
// para que se vea continuo aunque los updates lleguen espaciados. Todo se
// escribe DIRECTO al DOM (transform de un <g>) en un rAF, sin re-render.

// Cuanto proyectamos como maximo hacia adelante (ms).
const MAX_PROJECT_MS = 220;
// Suavizado exponencial de la velocidad entre dos detecciones.
const VELOCITY_ALPHA = 0.5;
// Constante de tiempo del GLIDE del box entre detecciones (deslizamiento
// suave frame-rate-independiente via 1-exp(-dt/TAU)). 70ms ≈ glide de ~200ms.
const GLIDE_TAU_MS = 70;
// Salto entre detecciones (en multiplos del tamano de cara) por encima del
// cual NO interpretamos movimiento continuo (reaparicion / cambio de
// identidad): no estimamos velocidad. Umbral efectivo = 1.0x el tamano de
// cara. (El reset del GLIDE usa su propio umbral aparte: maxGlide = 2.5x.)
const VELOCITY_OUTLIER_FACE_RATIO = 1.0;
// dt valido entre frames para estimar velocidad (ms).
const MIN_DT_MS = 16;
const MAX_DT_MS = 1500;
// Sin detecciones frescas en este lapso, el overlay se desvanece.
const STALE_MS = 3000;

// faceBox de pyimage: {top,right,bottom,left} en px del frame analizado.
const faceToVideoRect = (faceBox) => {
  if (!faceBox) return null;
  const { top, right, bottom, left } = faceBox;
  if (![top, right, bottom, left].every((n) => Number.isFinite(n))) return null;
  return { x: left, y: top, width: right - left, height: bottom - top };
};

// clothing box de pyimage: {x1,y1,x2,y2} en px del frame analizado.
const clothingToVideoRect = (box) => {
  if (!box) return null;
  const { x1, y1, x2, y2 } = box;
  if (![x1, y1, x2, y2].every((n) => Number.isFinite(n))) return null;
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
};

// Etiqueta compacta "Nombre + badge" sobre el bbox de la cara. Coordenadas
// RELATIVAS al grupo del bbox facial. Las medidas van en unidades del video
// (el SVG las escala con el mismo factor que el frame).
const FaceLabel = ({ name, badgeText, faceY, color, unit }) => {
  const fontSize = Math.max(10, unit * 0.011);
  const nameW = Math.max(80, name.length * fontSize * 0.6 + 16);
  const badgeW = Math.max(28, badgeText.length * fontSize * 0.7 + 14);
  const totalW = nameW + badgeW + 6;
  const labelH = fontSize * 1.7;
  const x = 0;
  const labelY = Math.max(-faceY, -(labelH + 4));
  return (
    <g>
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
      <line
        x1={x + nameW + 3}
        y1={labelY + 4}
        x2={x + nameW + 3}
        y2={labelY + labelH - 4}
        stroke="rgba(0,0,0,0.5)"
        strokeWidth="1"
      />
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

// Construye la lista de estudiantes a dibujar en COORDENADAS DEL VIDEO
// (sin escalar a render: el SVG con viewBox del video + slice hace el resto).
// Funcion pura. `key` determinista (carnet o indice) con sufijo #N para
// desambiguar studentCards duplicados en un mismo frame.
const buildStudents = (liveFrame, videoSize) => {
  const students = liveFrame?.students || [];
  const vw = videoSize.width;
  const vh = videoSize.height;
  const keyCounts = new Map();

  return students.map((student, idx) => {
    const state = classifyStudent(student);
    const color = student.hasAccessory ? ACCESORY_STROKE : STROKE_BY_STATE[state];
    const face = faceToVideoRect(student.faceBox);

    const isDegenerateFace =
      face &&
      ((face.width >= vw - 4 && face.height >= vh - 4) || face.width < 10 || face.height < 10);
    const useFallback = !face || isDegenerateFace;

    const fallbackSize = Math.min(vw, vh) * 0.25;
    const faceX = useFallback ? (vw - fallbackSize) / 2 : face.x;
    const faceY = useFallback ? (vh - fallbackSize) / 2 : face.y;
    const faceW = useFallback ? fallbackSize : face.width;
    const faceH = useFallback ? fallbackSize : face.height;

    const baseKey = student.studentCard ? `s-${student.studentCard}` : `u-${idx}`;
    const occ = keyCounts.get(baseKey) || 0;
    keyCounts.set(baseKey, occ + 1);
    const key = occ === 0 ? baseKey : `${baseKey}#${occ}`;

    const clothes = (student.clothingBoxes || [])
      .map((cb) => {
        const r = clothingToVideoRect(cb.box);
        if (!r) return null;
        return { ...r, color: clothingStroke(cb.valid), cls: (cb.class || '').toUpperCase() };
      })
      .filter(Boolean);

    return {
      key,
      color,
      name: studentLabel(student),
      badgeText: STATE_BADGE_TEXT[state],
      useFallback,
      faceX,
      faceY,
      faceW,
      faceH,
      clothes,
    };
  });
};

const LiveBoundingBoxes = ({ cameraId, videoSize }) => {
  const liveFrame = useDetectionStore((s) => s.liveDetections[cameraId]);

  const svgRef = useRef(null);
  // Datos de tracks (posicion base + velocidad + offset + t) leidos por el
  // rAF. Se mutan SOLO dentro de effects/rAF, nunca durante el render.
  const tracksRef = useRef(new Map());
  const measuredAtRef = useRef(0);
  const receivedAtRef = useRef(0);

  const vw = videoSize?.width > 0 ? videoSize.width : 640;
  const vh = videoSize?.height > 0 ? videoSize.height : 480;

  // Reconstruye el arbol SVG SOLO cuando cambia el frame (no en cada tick):
  // funcion pura, coordenadas del video, sin refs.
  const students = useMemo(() => {
    if (!videoSize || !liveFrame) return [];
    return buildStudents(liveFrame, videoSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveFrame, vw, vh]);

  // Con cada frame nuevo, estima velocidad (unidades de video / ms) y
  // re-basa el offset del glide. Corre en un effect (post-commit).
  useEffect(() => {
    if (!liveFrame) return;
    const measuredAt = liveFrame.frameTimestamp || liveFrame._receivedAt || Date.now();
    const prevTracks = tracksRef.current;
    const usedPrevKeys = new Set();
    const nextTracks = new Map();
    for (const s of students) {
      const cx = s.faceX + s.faceW / 2;
      const cy = s.faceY + s.faceH / 2;
      // Apareamiento con la deteccion anterior del MISMO fisico: por carnet
      // (fiable) si lo hay; si no, por cercania de centro entre los tracks
      // previos aun no usados (los desconocidos no traen id estable).
      let prevKey = null;
      if (s.key.startsWith('s-') && prevTracks.has(s.key)) {
        prevKey = s.key;
      } else {
        let bestD = Infinity;
        const thr = Math.max(s.faceW, s.faceH) * 1.2;
        for (const [pk, pt] of prevTracks) {
          if (usedPrevKeys.has(pk)) continue;
          const d = Math.hypot(pt.cx - cx, pt.cy - cy);
          if (d < thr && d < bestD) {
            bestD = d;
            prevKey = pk;
          }
        }
      }
      const prev = prevKey ? prevTracks.get(prevKey) : null;
      if (prevKey) usedPrevKeys.add(prevKey);

      let vx = 0;
      let vy = 0;
      if (prev) {
        const dt = measuredAt - prev.t;
        if (dt >= MIN_DT_MS && dt <= MAX_DT_MS) {
          const dx = s.faceX - prev.x;
          const dy = s.faceY - prev.y;
          const outlier =
            Math.abs(dx) > s.faceW * VELOCITY_OUTLIER_FACE_RATIO ||
            Math.abs(dy) > s.faceH * VELOCITY_OUTLIER_FACE_RATIO;
          if (!outlier) {
            vx = prev.vx * (1 - VELOCITY_ALPHA) + (dx / dt) * VELOCITY_ALPHA;
            vy = prev.vy * (1 - VELOCITY_ALPHA) + (dy / dt) * VELOCITY_ALPHA;
          }
        }
      }

      // Re-basar el offset visual para CONTINUIDAD: el box venia dibujado en
      // (prev.x + prev.ox). La nueva base medida es s.faceX. Arrancamos el
      // offset en (viejo_dibujado - nueva_base) para que NO salte; el rAF lo
      // desliza hacia la proyeccion. Snap si el salto es enorme (reaparicion).
      let ox = 0;
      let oy = 0;
      if (prev) {
        ox = prev.x + (prev.ox || 0) - s.faceX;
        oy = prev.y + (prev.oy || 0) - s.faceY;
        const maxGlide = Math.max(s.faceW, s.faceH) * 2.5;
        if (Math.abs(ox) > maxGlide || Math.abs(oy) > maxGlide) {
          ox = 0;
          oy = 0;
        }
      }
      nextTracks.set(s.key, { x: s.faceX, y: s.faceY, cx, cy, vx, vy, t: measuredAt, ox, oy });
    }
    tracksRef.current = nextTracks;
    measuredAtRef.current = measuredAt;
    receivedAtRef.current = liveFrame._receivedAt || Date.now();
  }, [students, liveFrame]);

  // Un unico rAF desliza cada box (glide + proyeccion) y controla el
  // stale-fade. Escribe transform/opacity DIRECTO al DOM (cero re-renders),
  // localizando los <g> por data-track-key. Todo en unidades del video.
  useEffect(() => {
    let raf = 0;
    let lastOpacity = '';
    let lastT = performance.now();
    const loop = () => {
      const svg = svgRef.current;
      const nowP = performance.now();
      const dtFrame = Math.min(64, nowP - lastT);
      lastT = nowP;
      const ease = 1 - Math.exp(-dtFrame / GLIDE_TAU_MS);
      if (svg) {
        const now = Date.now();
        const maxShiftX = vw * 0.15;
        const maxShiftY = vh * 0.15;
        const nodes = svg.querySelectorAll('g[data-track-key]');
        for (const el of nodes) {
          const t = tracksRef.current.get(el.dataset.trackKey);
          if (!t) {
            if (el._liveTf !== 'translate(0px, 0px)') {
              el.style.transform = 'translate(0px, 0px)';
              el._liveTf = 'translate(0px, 0px)';
            }
            continue;
          }
          // dtProj POR-TRACK (now - t.t): un track recien creado/re-basado no
          // hereda el dtProj de otro. Objetivo = proyeccion de velocidad; el
          // offset se desliza hacia el con suavizado (glide entre detecciones).
          const dtProj = Math.min(MAX_PROJECT_MS, Math.max(0, now - t.t));
          const targetX = Math.max(-maxShiftX, Math.min(maxShiftX, t.vx * dtProj));
          const targetY = Math.max(-maxShiftY, Math.min(maxShiftY, t.vy * dtProj));
          let ox = (t.ox || 0) + (targetX - (t.ox || 0)) * ease;
          let oy = (t.oy || 0) + (targetY - (t.oy || 0)) * ease;
          if (Math.abs(ox - targetX) < 0.3) ox = targetX;
          if (Math.abs(oy - targetY) < 0.3) oy = targetY;
          t.ox = ox;
          t.oy = oy;
          const tf = `translate(${ox.toFixed(2)}px, ${oy.toFixed(2)}px)`;
          if (el._liveTf !== tf) {
            el.style.transform = tf;
            el._liveTf = tf;
          }
        }
        const op = receivedAtRef.current > 0 && now - receivedAtRef.current > STALE_MS ? '0' : '1';
        if (op !== lastOpacity) {
          svg.style.opacity = op;
          lastOpacity = op;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [vw, vh]);

  if (!videoSize || !liveFrame) return null;

  // strokeWidth en unidades de video. El SVG (slice) las escala junto con el
  // frame, asi que el grosor en pantalla acompana el tamano del tile.
  const faceStrokeWidth = Math.max(2, vw / 320);
  const clothingStrokeWidth = Math.max(1.5, vw / 480);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${vw} ${vh}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ transition: 'opacity 600ms ease-out', willChange: 'opacity' }}
    >
      {students.map((s) => (
        // <g> exterior: el rAF (via data-track-key) le aplica el transform de
        // glide/proyeccion. Sus hijos estan en coordenadas del VIDEO; el
        // transform los desplaza a todos juntos (cara + label + ropa).
        <g key={s.key} data-track-key={s.key} style={{ willChange: 'transform' }}>
          <g transform={`translate(${s.faceX}, ${s.faceY})`}>
            <rect
              x={0}
              y={0}
              width={s.faceW}
              height={s.faceH}
              fill="none"
              stroke={s.color}
              strokeWidth={faceStrokeWidth}
              strokeDasharray={s.useFallback ? '6 4' : undefined}
              rx={s.useFallback ? 6 : Math.max(4, vw / 240)}
              style={{ filter: `drop-shadow(0 0 ${s.useFallback ? 6 : 4}px ${s.color})` }}
            />
            <FaceLabel
              name={s.name}
              badgeText={s.badgeText}
              faceY={s.faceY}
              color={s.color}
              unit={vw}
            />
          </g>

          {/* Bboxes de ropa: cada prenda con su color semantico. */}
          {s.clothes.map((cb, i) => {
            const fontSize = Math.max(8, vw * 0.0085);
            return (
              <g key={`cl-${i}`} transform={`translate(${cb.x}, ${cb.y})`}>
                <rect
                  x={0}
                  y={0}
                  width={cb.width}
                  height={cb.height}
                  fill="none"
                  stroke={cb.color}
                  strokeWidth={clothingStrokeWidth}
                  strokeDasharray={`${vw * 0.012} ${vw * 0.006}`}
                  rx={3}
                  opacity="0.9"
                  style={{ filter: `drop-shadow(0 0 3px ${cb.color})` }}
                />
                <text
                  x={0}
                  y={cb.height + fontSize * 1.3}
                  fill={cb.color}
                  fontSize={fontSize}
                  fontFamily="monospace"
                  fontWeight="bold"
                  style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.95))' }}
                >
                  {cb.cls}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
};

export default memo(LiveBoundingBoxes);
