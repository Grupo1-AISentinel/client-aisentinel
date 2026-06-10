import { create } from 'zustand';

const MAX_PER_CAMERA = 6;
const MAX_FEED = 12;
const AUTO_DISMISS_MS = 8000;
const MIN_LIVE_FRAME_INTERVAL_MS = 50;

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
    const prev = get().liveDetections[cameraId];
    if (prev && now - prev._receivedAt < MIN_LIVE_FRAME_INTERVAL_MS) return;

    const students = Array.isArray(payload.students) ? payload.students.map(normalizeStudent) : [];
    const videoSize =
      payload.videoSize || students.find((s) => s.videoSize)?.videoSize || prev?.videoSize || null;

    set((state) => ({
      liveDetections: {
        ...state.liveDetections,
        [cameraId]: {
          students,
          videoSize,
          timestamp: payload.timestamp || new Date(now).toISOString(),
          _receivedAt: now,
        },
      },
    }));
  },

  clearLiveDetection: (cameraId) => {
    set((state) => {
      if (!state.liveDetections[cameraId]) return state;
      const next = { ...state.liveDetections };
      delete next[cameraId];
      return { liveDetections: next };
    });
  },

  clearAllLiveDetections: () => set({ liveDetections: {} }),

  setPyimageConnected: (connected) => set({ pyimageConnected: Boolean(connected) }),
}));
