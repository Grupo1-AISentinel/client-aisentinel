import { useEffect } from 'react';

const tracksByCamera = new Map();

const getCameraTracks = (cameraId) => {
  let t = tracksByCamera.get(cameraId);
  if (!t) {
    t = { map: new Map(), nextUnknownId: 0, _lastFrameRef: null };
    tracksByCamera.set(cameraId, t);
  }
  return t;
};

const faceToState = (faceBox) => {
  if (!faceBox) return { x: 0.5, y: 0.5, w: 0.1, h: 0.1 };
  const x = faceBox.left;
  const y = faceBox.top;
  const w = faceBox.right - faceBox.left;
  const h = faceBox.bottom - faceBox.top;
  return { x, y, w, h };
};

const stateToFace = (s) => ({
  top: s.y,
  right: s.x + s.w,
  bottom: s.y + s.h,
  left: s.x,
});

const ALPHA = 0.45;
const MIN_DT = 1;
const MAX_DT = 3000;
const STALE_MS = 4000;
const OUTLIER_RATIO = 0.4;
// Half-life de la velocidad: cuanto tarda en decaerse a la mitad.
// Antes era 600ms (decay rapido) lo que congelaba el bbox despues de
// 1-2 frames. Ahora 2500ms para que la velocidad persista ~7 segundos
// sin deteccion antes de desvanecerse.
const VELOCITY_HALFLIFE_MS = 2500;

export const useTrackedDetections = (cameraId, liveFrame) => {
  useEffect(() => {
    if (!cameraId) return undefined;
    const tracks = getCameraTracks(cameraId);
    // FIX DEFINITIVO: usar Date.now() (epoch) en vez de performance.now()
    // (ms desde page load). El store setea _receivedAt con Date.now(), asi
    // que performance.now() daba un mismatch de escala que causaba:
    //   - ageMs negativo gigante (frameReceivedAt - now donde uno es
    //     epoch ~1.7e12 y otro es performance ~5000)
    //   - matcher saltaba todos los tracks (dtFrame > 2000 falso positivo)
    //   - tracks fantasma crecian 1->2->3->4->...
    //   - bboxes en posiciones absurdas o tamaño 0
    // Con Date.now() en ambos lugares, las diferencias son pequenas y
    // positivas como deben ser.
    const now = Date.now();
    // Para el caso "no students", usamos `now` (no hay frameReceivedAt).
    // Esto solo ocurre cuando el liveFrame no tiene detecciones, asi que no
    // hay un nuevo frameReceivedAt a usar; el use `now` aqui es seguro porque
    // el siguiente frame (con students > 0) usara frameReceivedAt para el
    // matcher y la proyeccion.

    if (!liveFrame || !Array.isArray(liveFrame.students) || liveFrame.students.length === 0) {
      for (const t of tracks.map.values()) {
        const dt = Math.max(0, now - t.lastSeenMs);
        if (dt < MAX_DT) {
          t.x += t.vx * dt;
          t.y += t.vy * dt;
          t.w += t.vw * dt;
          t.h += t.vh * dt;
          // Mismo half-life que el projection loop principal (2500ms).
          const decay = Math.exp((-dt * Math.LN2) / VELOCITY_HALFLIFE_MS);
          t.vx *= decay;
          t.vy *= decay;
          t.vw *= decay;
          t.vh *= decay;
        }
        t.lastSeenMs = now;
      }
      return undefined;
    }

    if (tracks._lastFrameRef === liveFrame) return undefined;
    tracks._lastFrameRef = liveFrame;

    const frameReceivedAt = liveFrame._receivedAt ?? now;
    const existingById = tracks.map;
    const unmatched = new Set(existingById.keys());

    for (const student of liveFrame.students) {
      const cardId = student.studentCard ? `s-${student.studentCard}` : null;
      const measured = faceToState(student.faceBox);

      let track = cardId ? existingById.get(cardId) : null;

      if (!track) {
        let bestId = null;
        let bestDist = Infinity;
        for (const id of unmatched) {
          const t = existingById.get(id);
          if (!t) continue;
          if (now - t.lastSeenMs > 2000) continue;
          const dtFrame = frameReceivedAt - t.lastSeenMs;
          if (dtFrame < 0 || dtFrame > 2000) continue;
          const px = t.x + t.vx * dtFrame;
          const py = t.y + t.vy * dtFrame;
          const dx = px - measured.x;
          const dy = py - measured.y;
          const dist = Math.hypot(dx, dy);
          const threshold = Math.max(measured.w, measured.h) * 0.7;
          if (dist < threshold && dist < bestDist) {
            bestDist = dist;
            bestId = id;
          }
        }
        if (bestId) {
          track = existingById.get(bestId);
        }
      }

      if (!track) {
        const newId = cardId || `u-${tracks.nextUnknownId++}-${Date.now()}`;
        track = {
          id: newId,
          x: measured.x,
          y: measured.y,
          w: measured.w,
          h: measured.h,
          vx: 0,
          vy: 0,
          vw: 0,
          vh: 0,
          lastSeenMs: frameReceivedAt,
          lastMatchedMs: frameReceivedAt,
          raw: student,
          streak: 1,
        };
        existingById.set(newId, track);
      } else {
        unmatched.delete(track.id);
        const dt = Math.max(MIN_DT, Math.min(MAX_DT, frameReceivedAt - track.lastSeenMs));

        const predX = track.x + track.vx * dt;
        const predY = track.y + track.vy * dt;
        const predW = track.w + track.vw * dt;
        const predH = track.h + track.vh * dt;

        const dxAbs = Math.abs(measured.x - predX);
        const dyAbs = Math.abs(measured.y - predY);
        const isOutlier =
          dxAbs > measured.w * OUTLIER_RATIO * 2 || dyAbs > measured.h * OUTLIER_RATIO * 2;

        let nx;
        let ny;
        let nw;
        let nh;
        if (isOutlier) {
          nx = measured.x;
          ny = measured.y;
          nw = measured.w;
          nh = measured.h;
          track.vx = 0;
          track.vy = 0;
          track.vw = 0;
          track.vh = 0;
        } else {
          nx = predX * (1 - ALPHA) + measured.x * ALPHA;
          ny = predY * (1 - ALPHA) + measured.y * ALPHA;
          nw = predW * (1 - ALPHA) + measured.w * ALPHA;
          nh = predH * (1 - ALPHA) + measured.h * ALPHA;
          if (dt < MAX_DT) {
            track.vx = (nx - track.x) / dt;
            track.vy = (ny - track.y) / dt;
            track.vw = (nw - track.w) / dt;
            track.vh = (nh - track.h) / dt;
          }
        }
        track.x = nx;
        track.y = ny;
        track.w = nw;
        track.h = nh;
        track.lastSeenMs = frameReceivedAt;
        track.lastMatchedMs = frameReceivedAt;
        track.raw = student;
        track.streak = (track.streak ?? 0) + 1;
      }
    }

    for (const [id, t] of existingById) {
      if (unmatched.has(id)) {
        const dt = Math.max(0, frameReceivedAt - t.lastSeenMs);
        if (dt < MAX_DT) {
          t.x += t.vx * dt;
          t.y += t.vy * dt;
          t.w += t.vw * dt;
          t.h += t.vh * dt;
          // Half-life exponencial: la velocidad decae a la mitad cada
          // VELOCITY_HALFLIFE_MS. Con 2500ms, la velocidad persiste
          // ~7 segundos antes de ser despreciable. Antes era 600ms
          // (decay a 26% en 1 frame) lo que congelaba el bbox.
          const decay = Math.exp((-dt * Math.LN2) / VELOCITY_HALFLIFE_MS);
          t.vx *= decay;
          t.vy *= decay;
          t.vw *= decay;
          t.vh *= decay;
        }
        t.lastSeenMs = frameReceivedAt;
      }
    }
    return undefined;
  }, [cameraId, liveFrame]);

  if (!cameraId) return [];
  // Lectura intencional del Map module-level en cada render. El Map es la
  // fuente de verdad del tracker (sobrevive re-mounts, HMR, etc.) y se
  // actualiza desde el useEffect superior con cada liveFrame nuevo.
  // Esta lectura es intencionalmente impura: la mutacion ocurre arriba, no aca.

  const tracks = tracksByCamera.get(cameraId);
  if (!tracks) return [];
  // FIX: Date.now() (epoch) consistente con el useEffect y el store.
  const now = Date.now();
  const result = [];
  for (const track of tracks.map.values()) {
    const ageMs = now - track.lastSeenMs;
    if (ageMs > STALE_MS) continue;
    let x = track.x;
    let y = track.y;
    let w = track.w;
    let h = track.h;
    if (ageMs > 0 && ageMs < MAX_DT) {
      x += track.vx * ageMs;
      y += track.vy * ageMs;
      w += track.vw * ageMs;
      h += track.vh * ageMs;
    }
    x = Math.max(0, Math.min(1 - w, x));
    y = Math.max(0, Math.min(1 - h, y));
    w = Math.max(0.01, Math.min(1 - x, w));
    h = Math.max(0.01, Math.min(1 - y, h));

    result.push({
      id: track.id,
      student: track.raw,
      faceBox: stateToFace({ x, y, w, h }),
      measuredFaceBox: track.raw?.faceBox ?? null,
      clothingBoxes: track.raw?.clothingBoxes ?? [],
      ageMs,
      streak: track.streak,
    });
  }
  return result;
};

export default useTrackedDetections;
