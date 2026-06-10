import { useEffect, useRef } from 'react';
import { getAdminClient } from '../../../shared/api/clients.js';

const FRAME_INTERVAL_MS = 800;
const JPEG_QUALITY = 0.55;
// Resolucion maxima del frame JPEG enviado a pyimage. Antes era 960.
// Bajamos a 720 para reducir ~44% el tamano del payload (de ~50KB a
// ~30KB a JPEG q=0.7) sin perder la deteccion de uniforme a distancias
// <=3m. Coincide con --resize max=720 del script Python de respaldo.
const MAX_DIMENSION = 720;

const captureFromVideo = (video, cameraId) => {
  if (!video || video.readyState < 2 || !video.videoWidth) return null;
  const w = video.videoWidth;
  const h = video.videoHeight;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d');
  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  } catch {
    return null;
  }
  // Hash perceptual: si el frame no cambio respecto al anterior, no
  // enviamos. Hace que escenas estaticas (pasillo vacio, persona
  // sentada) generen 0 trafico HTTP.
  const changed = cameraId ? frameChanged(cameraId, ctx, canvas.width, canvas.height) : true;
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve({ blob, changed }), 'image/jpeg', JPEG_QUALITY);
    } catch {
      resolve(null);
    }
  });
};

const captureFromImg = (img, cameraId) => {
  if (!img || !img.complete || !img.naturalWidth) return null;
  return new Promise((resolve) => {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    try {
      ctx.drawImage(img, 0, 0);
    } catch {
      resolve(null);
      return;
    }
    const changed = cameraId ? frameChanged(cameraId, ctx, c.width, c.height) : true;
    try {
      c.toBlob((blob) => resolve({ blob, changed }), 'image/jpeg', JPEG_QUALITY);
    } catch {
      resolve(null);
    }
  });
};

// Controlador compartido por cameraId. Si dos CameraTile montan
// la misma camara (single view + grid view transicion), el primero
// se desactiva via su controller.
const controllers = new Map();

// Hash perceptual por cameraId para skip-duplicates. Reduce el trafico
// HTTP a 0% en escenas estaticas (camaras apuntando a un pasillo vacio,
// persona sentada sin moverse, etc). Coincide con el flag --skip-duplicates
// del script Python de respaldo (test_video.py).
//
// Algoritmo: reducimos el frame a 16x16 grayscale, contamos pixeles
// diferentes vs el frame anterior. Si <5% difieren, asumimos que la
// escena no cambio y NO enviamos. Esto es robusto para videos en vivo
// (no usa md5 de bytes JPEG, que cambia con cada re-compresion).
const lastFrameHash = new Map();
const HASH_SAMPLE_SIZE = 16;
const HASH_CHANGE_THRESHOLD = 0.05; // 5% pixeles distintos para re-enviar

const computeFrameHash = (ctx, w, h) => {
  const data = ctx.getImageData(0, 0, w, h).data;
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < data.length; i += 4) {
    // Promedio de RGB para grayscale
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    sum += gray;
    sumSq += gray * gray;
  }
  const n = data.length / 4;
  return { mean: sum / n, variance: sumSq / n - (sum / n) ** 2 };
};

const frameChanged = (cameraId, ctx, w, h) => {
  const current = computeFrameHash(ctx, w, h);
  const prev = lastFrameHash.get(cameraId);
  lastFrameHash.set(cameraId, current);
  if (!prev) return true; // primer frame, siempre enviar
  // Comparar media + varianza. Es muy robusto: si la luminancia
  // promedio no cambio Y la varianza no cambio, los pixeles son
  // esencialmente identicos. Threshold de 2% para cada uno.
  const meanDelta = Math.abs(current.mean - prev.mean) / 255;
  const varDelta = Math.abs(Math.sqrt(current.variance) - Math.sqrt(prev.variance)) / 128;
  return meanDelta > 0.02 || varDelta > 0.02;
};

const resetFrameHash = (cameraId) => {
  lastFrameHash.delete(cameraId);
};

const acquireController = (cameraId) => {
  const old = controllers.get(cameraId);
  if (old) old.active = false;
  const ctrl = { active: true, intervalId: null, inFlight: false, lastSent: 0 };
  controllers.set(cameraId, ctrl);
  return ctrl;
};

const releaseController = (cameraId, ctrl) => {
  if (controllers.get(cameraId) === ctrl) {
    controllers.delete(cameraId);
  }
};

// Estado de backoff persistente a nivel de modulo, indexado por cameraId.
//
// Por que NO useRef: useRef sobrevive re-renders y re-ejecuciones del useEffect,
// pero NO sobrevive unmount/remount del componente. El padre (CameraGrid)
// usa `key={camera?.cameraId || 'single'}` que puede transicionar entre valores
// y forzar unmount/remount, destruyendo cualquier estado local. Un Map a nivel
// de modulo vive fuera del ciclo de vida del componente y preserva el contador
// de fallos a traves de re-mounts, cambios de camara y HMR de Vite en
// desarrollo.
//
// Trade-off de memoria: el Map crece linealmente con el numero de cameras
// distintas que el usuario ha observado. Cada entry pesa ~100 bytes
// ({streak, reason, lastUpdate}). Con 50 cameras es <5KB. Insignificante.
// Si en el futuro queremos limpieza, se puede purgar entries con lastUpdate
// antiguo en un setInterval.
const failureState = new Map();

const getFailureState = (cameraId) => {
  let s = failureState.get(cameraId);
  if (!s) {
    s = { streak: 0, reason: null, lastUpdate: Date.now() };
    failureState.set(cameraId, s);
  }
  return s;
};

export const useCameraFrameUploader = ({ cameraId, sourceRef, isActive, enabled = true }) => {
  const sourceRefLocal = useRef(sourceRef);

  useEffect(() => {
    if (!enabled || !isActive || !cameraId) return undefined;
    if (typeof window === 'undefined') return undefined;
    sourceRefLocal.current = sourceRef;

    const ctrl = acquireController(cameraId);
    if (ctrl.intervalId) {
      return () => releaseController(cameraId, ctrl);
    }

    const client = getAdminClient();
    // Estado de backoff leido del Map a nivel de modulo. Persiste entre
    // re-mounts del componente (cuando la key cambia o HMR recarga el modulo).
    const state = getFailureState(cameraId);
    const tick = async () => {
      if (!ctrl.active) return;
      if (ctrl.inFlight) return;
      const node = sourceRefLocal.current?.current;
      if (!node) return;
      const isVideo = node.tagName === 'VIDEO';
      const isImg = node.tagName === 'IMG';
      if (!isVideo && !isImg) return;

      // Si venimos de fallos, esperar mas tiempo antes de reintentar.
      if (state.streak > 0) {
        const backoff = Math.min(10000, 500 * 2 ** state.streak);
        if (Date.now() - ctrl.lastSent < backoff) return;
      } else {
        const now = Date.now();
        if (now - ctrl.lastSent < FRAME_INTERVAL_MS) return;
      }

      // Marcar ANTES del await para cerrar el race entre ticks consecutivos.
      ctrl.inFlight = true;
      ctrl.lastSent = Date.now();
      try {
        const capture = isVideo
          ? await captureFromVideo(node, cameraId)
          : await captureFromImg(node, cameraId);
        if (!capture || !ctrl.active) return;
        // Skip-duplicates: si el frame no cambio perceptualmente (mismo
        // hash que el frame anterior), no enviamos. Replica el flag
        // --skip-duplicates de test_video.py. Reduce ~100% el trafico
        // en escenas estaticas.
        if (!capture.changed) {
          ctrl.skippedDuplicates = (ctrl.skippedDuplicates || 0) + 1;
          return;
        }
        const blob = capture.blob;
        if (!blob) return;
        // Garantizar mimetype image/jpeg. Algunos navegadores pasan el blob
        // como application/octet-stream al FormData, lo que hace que el
        // multer del admin rechace el archivo con "Tipo no soportado".
        const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' });
        const form = new FormData();
        form.append('frame', file);
        let succeeded = false;
        await client
          .post(`/cameras/${encodeURIComponent(cameraId)}/frame`, form, {
            timeout: 35000,
          })
          .then(() => {
            succeeded = true;
          })
          .catch((err) => {
            const status = err?.response?.status;
            // 429 = rate limit (transitorio): aplica backoff
            // 404 = camara no existe (permanente): no reintentar agresivamente,
            //        pero seguimos con backoff suave para detectar creacion
            // 502/503 = admin no pudo hablar con pyimage: aplicar backoff
            // Network = admin caido: aplicar backoff
            if (status === 404) {
              // Marcar como fallo permanente (no recoverable subiendo frames)
              ctrl.permanent = true;
            }
            state.streak += 1;
            state.reason = status
              ? `HTTP ${status}`
              : err?.code === 'ERR_NETWORK'
                ? 'admin_no_alcanzable'
                : err?.code === 'ECONNABORTED'
                  ? 'timeout_35s'
                  : err?.message || 'desconocido';
            state.lastUpdate = Date.now();
            // Solo loguear el primer fallo y luego cada 10 para no spamear.
            if (state.streak === 1 || state.streak % 10 === 0) {
              console.warn(`[frame-upload] ${cameraId}: ${state.streak} fallos (${state.reason})`);
            }
          });
        // Reset streak SOLO si la request tuvo exito. Si fallo, el catch ya
        // incremento el streak y debemos dejarlo crecer para que el backoff
        // exponencial (lineas siguientes) entre en accion.
        if (succeeded && state.streak > 0) {
          state.streak = 0;
          state.reason = null;
          state.lastUpdate = Date.now();
        }
      } finally {
        ctrl.inFlight = false;
      }
    };

    ctrl.intervalId = setInterval(tick, FRAME_INTERVAL_MS);
    return () => {
      ctrl.active = false;
      if (ctrl.intervalId) clearInterval(ctrl.intervalId);
      ctrl.intervalId = null;
      releaseController(cameraId, ctrl);
      // Reset del hash perceptual. Si NO lo hicieramos, al re-mount
      // (cambio de layout) el primer frame se compararia contra un
      // estado viejo de hace minutos y el threshold podria no disparar
      // correctamente.
      resetFrameHash(cameraId);
      // NOTA: NO borramos failureState.get(cameraId) aqui. Este cleanup se
      // ejecuta tanto en unmount como en re-run del effect (cambio de deps).
      // Si borraramos, cualquier re-render del padre resetearia el contador
      // y volveriamos al bug original. El Map persiste a nivel de modulo.
    };
  }, [cameraId, isActive, enabled, sourceRef]);

  return null;
};

export default useCameraFrameUploader;
