export const ROLES = {
  ADMIN: 'ADMIN_ROLE',
  COORDINATOR: 'COORDINATOR_ROLE',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.COORDINATOR]: 'Coordinador',
};

export const GRADES = ['1RO', '2DO', '3RO', '4TO', '5TO', '6TO'];

export const UNIFORM_TYPES = ['JACKET', 'TSHIRT', 'PANTS'];

export const UNIFORM_TYPE_LABELS = {
  JACKET: 'Chaqueta',
  TSHIRT: 'Camisa',
  PANTS: 'Pantalón',
};

export const ALERT_REASONS = ['UNIFORME_INCOMPLETO', 'ACCESORIO_NO_PERMITIDO'];

export const ALERT_REASON_LABELS = {
  UNIFORME_INCOMPLETO: 'Uniforme incompleto',
  ACCESORIO_NO_PERMITIDO: 'Accesorio no permitido',
};

export const ALERT_STATUSES = ['NOTIFICADO_ALUMNO', 'REPORTADO_A_COORDINACION'];

export const ALERT_STATUS_LABELS = {
  NOTIFICADO_ALUMNO: 'Notificado al alumno',
  REPORTADO_A_COORDINACION: 'Reportado a coordinación',
};

export const AUDIT_ACTIONS = ['POST', 'PUT', 'DELETE', 'PATCH'];

export const DEFAULT_PAGE_SIZE = 10;

export const STORAGE_KEYS = {
  AUTH: 'aisentinel.auth',
};

export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CAMERA_STATUS: 'camera:status',
  CAMERA_ERROR: 'camera:error',
  DETECTION_ALERT: 'detection:alert',
  DETECTION_LIVE_FRAME: 'detection:live_frame',
  PYIMAGE_STATUS: 'pyimage:status',
  NOTIFICATION_NEW: 'notification:new',
  SUBSCRIBE_CAMERAS: 'subscribe_cameras',
  CAMERAS_CHANGED: 'cameras:changed',
};
