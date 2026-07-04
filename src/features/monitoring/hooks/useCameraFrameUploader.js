import { useEffect, useRef } from 'react';
import { getAdminClient } from '../../../shared/api/clients.js';
import { useDetectionStore } from '../stores/detectionStore.js';

// 150ms ≈ 6.7 fps de analisis. pyimage procesa un frame de 720px en
// ~15-40ms en regimen (pipeline batcheado + tracking con cache: el
// reconocimiento y el uniforme solo se recalculan para tracks nuevos o
// vencidos), asi que la cadencia la limita la red/captura, no la IA.
// Debe ser MAYOR que FRAME_THROTTLE_MS del admin (100ms) o el server
// responde 429.
// 80ms ≈ 12.5 fps de analisis. MEDIDO en vivo: pyimage procesa un frame de
// produccion en 15-55ms (desconocido 15-45ms; alumno con validacion de
// uniforme ~55ms) y el round-trip web completo (captura+encode ~20ms +
// browser->admin->pyimage->admin->browser) es ~56-80ms, con la GPU al
// 37-40% (hay margen). A 80ms el veredicto de uniforme se refresca ~25% mas
// seguido que a 100ms sin acumular cola (el flag inFlight salta solo en el
// pico ocasional y se autorregula). Debe ser MAYOR que FRAME_THROTTLE_MS del
// admin (45ms) para dejar 35ms de margen al jitter del timer sin 429.
const FRAME_INTERVAL_MS = 80;
// Calidad/resolucion del frame enviado. MEDIDO contra el video demo real
// (matriz calidad x resolucion, 6 frames): a 720px q=0.55 el reconocimiento
// facial acierta 1/6 frames (la cara de ~40px queda destruida por el JPEG y
// el nombre nunca aparece en el box); a 960px q=0.8 acierta 3/6 — el resto
// lo cubre el track cache de pyimage entre aciertos. Costo: payload 26->64KB
// y ~40ms extra de inferencia por frame, irrelevante para el pipeline actual
// (capacidad ~20 fps). NO bajar estos valores sin re-medir el reconocimiento.
const JPEG_QUALITY = 0.8;
const MAX_DIMENSION = 960;

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
  const changed = cameraId ? frameChanged(cameraId, canvas) : true;
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
    const changed = cameraId ? frameChanged(cameraId, c) : true;
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
// Algoritmo: reducimos el frame a 16x16 grayscale (drawImage a un canvas
// chico), comparamos media + desviacion vs el frame anterior. Si el
// cambio es minimo, asumimos que la escena no cambio y NO enviamos.
//
// BUG CORREGIDO: el codigo anterior llamaba getImageData(0, 0, w, h) con
// el canvas COMPLETO (hasta 720x1280 = ~900K pixeles), no el 16x16 que
// describian el comentario y HASH_SAMPLE_SIZE (declarada pero nunca
// usada). Eso costaba un getImageData + loop de ~900K iteraciones EN EL
// HILO PRINCIPAL cada 150ms, compitiendo con el render de React/el video
// — la causa mas probable del "atraso" reportado en el frontend (el
// backend por si solo mide 20-100ms/frame). Ademas, comparar media/
// varianza sobre TODA la imagen es insensible a movimiento localizado
// (una persona en una esquina de un frame grande apenas mueve el
// promedio global) -> el frame se descartaba como "sin cambios" pese a
// que la persona SI se habia movido, y el box solo se actualizaba cuando
// el movimiento acumulado por fin cruzaba el umbral: eso es exactamente
// el efecto de "salto tardio" que se veia en pantalla.
//
// Downscalear a un grid 16x16 antes de medir resuelve ambos problemas:
// el costo cae ~3500x (256 vs ~900K pixeles) y cada celda del grid
// promedia un area pequena, asi que el movimiento localizado SI mueve
// su celda de forma notoria.
const lastFrameHash = new Map();
const HASH_SAMPLE_SIZE = 16;
// Delta de media/desviacion (fraccion 0-1) para considerar que el frame cambio.
// MEDIDO sobre el video demo en movimiento (40 ticks/3.2s del hash 16x16 real):
// con 0.02 solo 2/40 frames superaban el umbral -> se subia ~5% del movimiento
// y el box quedaba congelado ("no se mueve acorde al estudiante"). La persona
// ocupa ~1/4 del frame, asi que moverse cambia POCO la media/varianza GLOBAL
// del grid: el grueso del movimiento real cae en 0.005-0.01. 0.006 captura
// ~15/40 (~37% -> ~4-6 fps de subida durante movimiento) y sigue descartando
// escenas estaticas (el piso de ruido de video/JPEG queda por debajo). Bajar
// esto es lo que hace que el box siga a la persona con densidad suficiente
// para que el glide del overlay se vea continuo, como el motor local.
const HASH_CHANGE_THRESHOLD = 0.006;

// Canvas reutilizable para el downscale del hash. `willReadFrequently`
// evita que Chrome mantenga este canvas respaldado por GPU (lo que
// penaliza cada getImageData con una lectura GPU->CPU).
const hashCanvas = document.createElement('canvas');
hashCanvas.width = HASH_SAMPLE_SIZE;
hashCanvas.height = HASH_SAMPLE_SIZE;
const hashCtx = hashCanvas.getContext('2d', { willReadFrequently: true });

const computeFrameHash = (sourceCanvas) => {
  hashCtx.drawImage(sourceCanvas, 0, 0, HASH_SAMPLE_SIZE, HASH_SAMPLE_SIZE);
  const data = hashCtx.getImageData(0, 0, HASH_SAMPLE_SIZE, HASH_SAMPLE_SIZE).data;
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

const frameChanged = (cameraId, sourceCanvas) => {
  const current = computeFrameHash(sourceCanvas);
  const prev = lastFrameHash.get(cameraId);
  lastFrameHash.set(cameraId, current);
  if (!prev) return true; // primer frame, siempre enviar
  // Comparar media + varianza. Es muy robusto: si la luminancia
  // promedio no cambio Y la varianza no cambio, los pixeles son
  // esencialmente identicos.
  const meanDelta = Math.abs(current.mean - prev.mean) / 255;
  const varDelta = Math.abs(Math.sqrt(current.variance) - Math.sqrt(prev.variance)) / 128;
  return meanDelta > HASH_CHANGE_THRESHOLD || varDelta > HASH_CHANGE_THRESHOLD;
};

const resetFrameHash = (cameraId) => {
  lastFrameHash.delete(cameraId);
};

const acquireController = (cameraId) => {
  const old = controllers.get(cameraId);
  if (old) old.active = false;
  const ctrl = { active: true, intervalId: null, inFlight: false, lastSent: 0, frameIdCounter: 0 };
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
        
        const frameTimestamp = Date.now();
        ctrl.frameIdCounter = (ctrl.frameIdCounter || 0) + 1;
        const currentFrameId = ctrl.frameIdCounter;
        const playheadTime = isVideo ? node.currentTime : null;

        // Garantizar mimetype image/jpeg. Algunos navegadores pasan el blob
        // como application/octet-stream al FormData, lo que hace que el
        // multer del admin rechace el archivo con "Tipo no soportado".
        const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' });
        const form = new FormData();
        form.append('frameId', currentFrameId.toString());
        form.append('frameTimestamp', frameTimestamp.toString());
        if (playheadTime !== null) {
          form.append('playheadTime', playheadTime.toString());
        }
        form.append('frame', file);
        
        let succeeded = false;
        await client
          .post(`/cameras/${encodeURIComponent(cameraId)}/frame`, form, {
            timeout: 35000,
          })
          .then((res) => {
            succeeded = true;
            // Pintar el box DIRECTO desde la respuesta HTTP en vez de esperar
            // el broadcast Socket.io `detection:live_frame`. El admin emite
            // ese evento DENTRO de este mismo handler, asi que la respuesta
            // que ya tenemos aqui llega ANTES que el rebote por el broker
            // socket.io (un round-trip extra medido en decenas de ms). El
            // guard MIN_LIVE_FRAME_INTERVAL_MS (50ms) del store descarta el
            // evento socket duplicado que llega despues. El socket sigue
            // sirviendo a OTROS espectadores de la misma camara.
            const lf = res?.data?.liveFrame;
            if (lf?.cameraId) {
              const rtt = Date.now() - frameTimestamp;
              if (rtt > 350) {
                console.warn(`[frame-upload] Frame descartado por tardío (RTT: ${rtt}ms)`);
                return;
              }
              useDetectionStore.getState().setLiveFrame(lf.cameraId, lf);
            }
          })
          .catch((err) => {
            const status = err?.response?.status;
            // 429 = throttle del admin (transitorio por jitter): NO entra al
            //        backoff exponencial — el intervalo (80ms) deja 35ms de
            //        margen sobre el throttle (45ms); un 429 espurio solo
            //        pierde un frame y el siguiente tick a 80ms ya cae fuera.
            // 404 = camara no existe (permanente): no reintentar agresivamente,
            //        pero seguimos con backoff suave para detectar creacion
            // 502/503 = admin no pudo hablar con pyimage: aplicar backoff
            // Network = admin caido: aplicar backoff
            if (status === 429) return;
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
