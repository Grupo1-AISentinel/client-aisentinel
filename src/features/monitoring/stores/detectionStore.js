import { create } from 'zustand';

const MAX_PER_CAMERA = 6;
const MAX_FEED = 12;
const AUTO_DISMISS_MS = 8000;
const MIN_LIVE_FRAME_INTERVAL_MS = 50;
// Retencion de la ultima deteccion: un frame aislado donde el detector
// pierde la cara (persona lejos, blur de movimiento) NO debe borrar los
// boxes al instante — eso produce parpadeo. Los frames vacios dentro de
// esta ventana se ignoran; si lo vacio persiste, el overlay se limpia.
const HOLD_LAST_DETECTION_MS = 1000;

const isValid = (detection) => detection && (detection._id || detection.id);

const normalizeStudent = (raw) => {
  if (!raw) return null;
  return {
    studentCard: raw.studentCard ?? null,
    studentName: raw.studentName ?? null,
    studentSurname: raw.studentSurname ?? null,
    grade: raw.grade ?? null,
    isUnknown: Boolean(raw.isUnknown),
    hasUniform: typeof raw.hasUniform === 'boolean' ? raw.hasUniform : null,
    hasAccessory: typeof raw.hasAccessory === 'boolean' ? raw.hasAccessory : null,
    reason: raw.reason ?? null,
    faceBox: raw.faceBox ?? null,
    clothingBoxes: Array.isArray(raw.clothingBoxes) ? raw.clothingBoxes : [],
    // Detalle textual del uniforme que envia pyimage. Lo guardamos para
    // que classifyStudent (en utils/detectionColors.js) pueda detectar
    // estado Parcial: si clothingDetails contiene "Sin Pantalon Visible"
    // o "requiere camisa oficial", se considera uniforme parcial aunque
    // hasUniform=true.
    clothingDetails: typeof raw.clothingDetails === 'string' ? raw.clothingDetails : null,
    videoSize: raw.videoSize ?? null,
    isNewAttendance: Boolean(raw.isNewAttendance),
    tracking: raw.tracking ?? null,
    confidence: typeof raw.confidence === 'number' ? raw.confidence : null,
  };
};

export const useDetectionStore = create((set, get) => ({
  detectionsByCamera: {},
  feed: [],
  liveDetections: {},
  liveDetectionsHistory: {},
  pyimageConnected: true,

  addDetection: (detection) => {
    if (!isValid(detection)) return;
    const cameraId = detection.cameraId;
    if (!cameraId) return;
    const stamped = {
      ...detection,
      _receivedAt: Date.now(),
      _expiresAt: Date.now() + AUTO_DISMISS_MS,
    };
    set((state) => {
      const byCamera = state.detectionsByCamera[cameraId] || [];
      const filtered = byCamera.filter((d) => d._id !== stamped._id);
      const nextByCamera = [stamped, ...filtered].slice(0, MAX_PER_CAMERA);
      const nextFeed = [stamped, ...state.feed].slice(0, MAX_FEED);
      return {
        detectionsByCamera: {
          ...state.detectionsByCamera,
          [cameraId]: nextByCamera,
        },
        feed: nextFeed,
      };
    });
  },

  removeDetection: (detectionId) => {
    set((state) => {
      const nextByCamera = { ...state.detectionsByCamera };
      let changed = false;
      for (const camId of Object.keys(nextByCamera)) {
        const before = nextByCamera[camId];
        const after = before.filter((d) => d._id !== detectionId);
        if (after.length !== before.length) {
          changed = true;
          if (after.length === 0) {
            delete nextByCamera[camId];
          } else {
            nextByCamera[camId] = after;
          }
        }
      }
      if (!changed) return state;
      return {
        detectionsByCamera: nextByCamera,
        feed: state.feed.filter((d) => d._id !== detectionId),
      };
    });
  },

  clearForCamera: (cameraId) => {
    set((state) => {
      const next = { ...state.detectionsByCamera };
      delete next[cameraId];
      return { detectionsByCamera: next };
    });
  },

  pruneExpired: () => {
    const now = Date.now();
    set((state) => {
      const nextByCamera = {};
      let changed = false;
      for (const camId of Object.keys(state.detectionsByCamera)) {
        const alive = state.detectionsByCamera[camId].filter((d) => d._expiresAt > now);
        if (alive.length !== state.detectionsByCamera[camId].length) changed = true;
        if (alive.length > 0) nextByCamera[camId] = alive;
      }
      if (!changed) return state;
      return { detectionsByCamera: nextByCamera };
    });
  },

  setLiveFrame: (cameraId, payload) => {
    if (!cameraId || !payload) return;
    const now = Date.now();

    // Descartar si el frame es muy antiguo (RTT > 400ms) para evitar saltos o retrasos perceptibles
    if (payload.frameTimestamp) {
      const age = now - payload.frameTimestamp;
      if (age > 400) {
        console.warn(`[detectionStore] Descartando frame antiguo de la cámara ${cameraId}: ${age}ms de retraso`);
        return;
      }
    }

    const prev = get().liveDetections[cameraId];
    if (prev && now - prev._receivedAt < MIN_LIVE_FRAME_INTERVAL_MS) return;

    const students = Array.isArray(payload.students) ? payload.students.map(normalizeStudent) : [];
    // Anti-parpadeo: frame vacio reciente tras una deteccion valida se
    // ignora (la transicion CSS sigue interpolando hacia la ultima
    // posicion conocida). Ver HOLD_LAST_DETECTION_MS.
    if (
      students.length === 0 &&
      prev?.students?.length > 0 &&
      now - prev._receivedAt < HOLD_LAST_DETECTION_MS
    ) {
      return;
    }
    const videoSize =
      payload.videoSize || students.find((s) => s.videoSize)?.videoSize || prev?.videoSize || null;

    const newFrame = {
      students,
      videoSize,
      timestamp: payload.timestamp || new Date(now).toISOString(),
      _receivedAt: now,
      frameId: payload.frameId || null,
      frameTimestamp: payload.frameTimestamp || null,
      playheadTime: payload.playheadTime ?? null,
    };

    set((state) => {
      const oldHistory = state.liveDetectionsHistory[cameraId] || [];
      const newHistory = [newFrame, ...oldHistory].slice(0, 15);
      return {
        liveDetections: {
          ...state.liveDetections,
          [cameraId]: newFrame,
        },
        liveDetectionsHistory: {
          ...state.liveDetectionsHistory,
          [cameraId]: newHistory,
        },
      };
    });
  },

  clearLiveDetection: (cameraId) => {
    set((state) => {
      if (!state.liveDetections[cameraId]) return state;
      const next = { ...state.liveDetections };
      delete next[cameraId];
      const nextHist = { ...state.liveDetectionsHistory };
      delete nextHist[cameraId];
      return { liveDetections: next, liveDetectionsHistory: nextHist };
    });
  },

  clearAllLiveDetections: () => set({ liveDetections: {}, liveDetectionsHistory: {} }),

  setPyimageConnected: (connected) => set({ pyimageConnected: Boolean(connected) }),
}));
