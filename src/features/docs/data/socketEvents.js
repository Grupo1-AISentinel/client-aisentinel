export const socketEvents = [
  {
    name: 'subscribe_cameras',
    direction: 'cliente → servidor',
    description: 'Solicita suscribirse al room camera:<id> para recibir detection:live_frame.',
    payload: { cameraIds: 'string[]', note: 'Si se omite o es array vacío, desuscribe de todas.' },
    example: { cameraIds: ['cam-entrance-1', 'cam-hallway-2'] },
    usedBy: ['server-admin-aisentinel/configs/socket-relay.js'],
  },
  {
    name: 'unsubscribe_cameras',
    direction: 'cliente → servidor',
    description: 'Sale de los rooms de cámaras.',
    payload: { cameraIds: 'string[]' },
    example: { cameraIds: ['cam-entrance-1'] },
  },
  {
    name: 'pyimage:detection_results',
    direction: 'pyimage → servidor',
    description:
      'pyimage envía resultado de detección. El admin enriquece con Mongo y emite detection:live_frame.',
    payload: {
      cameraId: 'string',
      timestamp: 'number (unix seconds)',
      videoSize: '{w:number, h:number}',
      results: 'Student[] (max 30)',
    },
    notes:
      'En la implementación actual el admin llama a pyimage por HTTP y emite detection:live_frame directamente. Este evento queda como hook para futuro flujo pyimage-as-push.',
  },
  {
    name: 'python_registro_completado',
    direction: 'pyimage → servidor',
    description: 'Notifica que el procesamiento de un registro terminó.',
    payload: { carnet: 'string' },
    example: { carnet: '2024001' },
  },
  {
    name: 'detection:live_frame',
    direction: 'servidor → cliente',
    description:
      'Frame procesado enriquecido con datos de Mongo. Shape idéntico a detection:alert.',
    payload: {
      cameraId: 'string',
      timestamp: 'ISO date string',
      videoSize: '{w, h}',
      students: 'Student[]',
    },
    example: {
      cameraId: 'cam-entrance-1',
      timestamp: '2025-11-08T12:00:00.000Z',
      videoSize: { w: 1280, h: 720 },
      students: [
        {
          studentCard: '2024001',
          studentName: 'Juan',
          studentSurname: 'Pérez',
          grade: '4TO',
          isUnknown: false,
          hasUniform: true,
          hasAccessory: false,
          reason: null,
          faceBox: { top: 120, right: 340, bottom: 280, left: 180 },
          clothingBoxes: [
            { class: 'shirt', valid: true, box: { x1: 100, y1: 300, x2: 380, y2: 480 } },
          ],
          isNewAttendance: true,
          confidence: 0.92,
        },
      ],
    },
    usedBy: ['client-aisentinel/src/features/monitoring/hooks/useLiveDetections.js'],
  },
  {
    name: 'detection:alert',
    direction: 'servidor → cliente',
    description: 'Alerta de infracción generada. Solo se emite cuando hay reason !== null.',
    payload: {
      cameraId: 'string',
      studentCard: 'string',
      reason: 'UNIFORME_INCOMPLETO | ACCESORIO_NO_PERMITIDO | PERSONA_DESCONOCIDA',
      faceBox: '{top,right,bottom,left}',
      clothingBoxes: 'Box[]',
    },
    usedBy: ['client-aisentinel/src/features/monitoring/hooks/useDetectionAlerts.js'],
  },
  {
    name: 'pyimage:status',
    direction: 'servidor → cliente',
    description: 'Cambio de estado del servicio de pyimage (broadcast).',
    payload: { connected: 'boolean' },
    example: { connected: true },
  },
  {
    name: 'camera:error',
    direction: 'servidor → cliente',
    description: 'Error de suscripción a una cámara. Solo al socket que intentó suscribirse.',
    payload: { cameraId: 'string', reason: 'NOT_FOUND | FORBIDDEN' },
    example: { cameraId: 'cam-x', reason: 'FORBIDDEN' },
  },
  {
    name: 'notification:new',
    direction: 'servidor → cliente',
    description: 'Nueva notificación in-app. Se emite al room user:<id> o role:<rol>.',
    payload: {
      id: 'string',
      type: 'string (ALERT | PYIMAGE_ONLINE | PYIMAGE_OFFLINE | ...)',
      title: 'string',
      message: 'string',
      data: 'object',
      createdAt: 'ISO date',
    },
    usedBy: ['client-aisentinel/src/features/notifications/hooks/useNotifications.js'],
  },
];

export const socketRooms = [
  { name: 'user:<id>', description: 'Canal privado de un usuario (notificaciones).' },
  { name: 'role:<rol>', description: 'Broadcast a todos los usuarios de un rol.' },
  { name: 'camera:<id>', description: 'Suscripción a frames en vivo de una cámara.' },
];

export const socketAuthModes = [
  {
    name: 'Frontend (usuario)',
    mechanism: 'JWT en handshake.auth.token',
    verify: 'jsonwebtoken.verify(token, JWT_SECRET, { issuer, audience })',
    data: '{ isPyimage: false, isFrontend: true, userId, userRole }',
  },
  {
    name: 'Pyimage (servicio)',
    mechanism: 'x-internal-api-key en handshake.auth.token',
    verify: 'Comparación directa con process.env.INTERNAL_API_KEY',
    data: '{ isPyimage: true, isFrontend: false }',
  },
];
