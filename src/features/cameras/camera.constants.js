export const CAMERA_TYPES = [
  { value: 'entrance', label: 'Entrada' },
  { value: 'hallway', label: 'Pasillo' },
  { value: 'classroom', label: 'Aula' },
  { value: 'outdoor', label: 'Exterior' },
];

export const IP_PROTOCOLS = [
  { value: 'mjpeg', label: 'MJPEG' },
  { value: 'hls', label: 'HLS' },
];

export const CAMERA_SOURCES = [
  { value: 'webcam', label: 'Webcam' },
  { value: 'video', label: 'Video (Demo)' },
  { value: 'ip', label: 'Cámara IP' },
  { value: 'wifi', label: 'WiFi', comingSoon: true },
];

export const CAMERA_SOURCE_LABELS = CAMERA_SOURCES.reduce((acc, s) => {
  acc[s.value] = s.label;
  return acc;
}, {});

export const CAMERA_TYPE_LABELS = CAMERA_TYPES.reduce((acc, t) => {
  acc[t.value] = t.label;
  return acc;
}, {});

export const DEFAULT_SOURCE_CONFIG = {
  webcam: { deviceId: '', facingMode: 'environment' },
  video: { path: '' },
  ip: { url: '', protocol: 'mjpeg' },
  wifi: { ssid: '' },
};

export const getVideoUrl = (filename) => {
  if (!filename) return null;
  const base = import.meta.env.VITE_VIDEOS_URL || 'http://localhost:3067/videos';
  return `${base.replace(/\/$/, '')}/${encodeURIComponent(filename)}`;
};
