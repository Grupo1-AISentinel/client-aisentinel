// Alertas, asistencia, inspecciones, estadísticas, auditorías, notificaciones,
// preferencias, admin tools, modelos 3D.

const alerts = [
  {
    method: 'POST',
    path: '/AISentinelAdmin/v1/alerts/automatic-detection',
    auth: 'x-internal-api-key',
    description:
      'Procesa detecciones de pyimage. Crea alertas y notificaciones según AlertPreference.',
    body: [
      { name: 'cameraId', type: 'string', required: true, description: 'ID cámara.' },
      { name: 'location', type: 'string', required: true, description: 'Ubicación.' },
      {
        name: 'results',
        type: 'StudentResult[]',
        required: true,
        description: 'Output de pyimage.',
      },
    ],
    responses: {
      200: { description: 'Procesado.', example: { processed: 3, alerts: 2 } },
      401: { description: 'API key inválida.' },
    },
  },
  {
    method: 'POST',
    path: '/AISentinelAdmin/v1/alerts/simulate',
    auth: 'JWT',
    roles: ['ADMIN_ROLE'],
    description: 'Crea alerta manual (demo/desarrollo).',
    body: [
      { name: 'studentCard', type: 'string', required: true, description: 'Carnet.' },
      {
        name: 'reason',
        type: 'string',
        required: true,
        description: 'UNIFORME_INCOMPLETO | ACCESORIO_NO_PERMITIDO.',
      },
    ],
    responses: { 201: { description: 'Alerta creada.' } },
  },
  {
    method: 'GET',
    path: '/AISentinelAdmin/v1/alerts/get',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Lista paginada de alertas.',
    query: [
      { name: 'page', type: 'number', required: false, description: 'Página.' },
      { name: 'limit', type: 'number', required: false, description: 'Resultados.' },
      { name: 'studentCard', type: 'string', required: false, description: 'Filtra por carnet.' },
      { name: 'reason', type: 'string', required: false, description: 'Filtra por motivo.' },
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'NOTIFICADO_ALUMNO | REPORTADO_A_COORDINACION.',
      },
      { name: 'from', type: 'date', required: false, description: 'Desde.' },
      { name: 'to', type: 'date', required: false, description: 'Hasta.' },
    ],
    responses: { 200: { description: 'Página de alertas.' } },
  },
];

const attendance = [
  {
    method: 'POST',
    path: '/AISentinelAdmin/v1/attendance/automatic-detection',
    auth: 'x-internal-token',
    description: 'Registra asistencia desde un resultado de detección.',
    body: [
      { name: 'studentCard', type: 'string', required: true, description: 'Carnet.' },
      { name: 'cameraId', type: 'string', required: true, description: 'Cámara.' },
      { name: 'location', type: 'string', required: true, description: 'Ubicación.' },
      { name: 'timestamp', type: 'date', required: false, description: 'Fecha del evento.' },
    ],
    responses: { 201: { description: 'Asistencia registrada.' } },
  },
  {
    method: 'GET',
    path: '/AISentinelAdmin/v1/attendance/daily-list',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Asistencias del día agrupadas por grado.',
    query: [
      { name: 'date', type: 'date', required: false, description: 'Fecha (default: hoy).' },
      { name: 'grade', type: 'string', required: false, description: 'Filtra por grado.' },
    ],
    responses: { 200: { description: 'Asistencias del día.' } },
  },
];

const inspections = [
  {
    method: 'GET',
    path: '/AISentinelAdmin/v1/inspections',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Estado de inspección por grado.',
    responses: {
      200: { description: 'Mapa grado → activo.', example: { '1RO': true, '2DO': false } },
    },
  },
  {
    method: 'PUT',
    path: '/AISentinelAdmin/v1/inspections/toggle/:grade',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Toggle on/off de inspección por grado.',
    pathParams: [{ name: 'grade', type: 'string', required: true, description: '1RO-6TO.' }],
    body: [{ name: 'isActive', type: 'boolean', required: true, description: 'true | false.' }],
    responses: { 200: { description: 'Actualizado.' } },
  },
];

const statistics = [
  {
    method: 'GET',
    path: '/AISentinelAdmin/v1/statistics/grades',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Estadísticas por grado.',
    query: [
      { name: 'from', type: 'date', required: false, description: 'Desde.' },
      { name: 'to', type: 'date', required: false, description: 'Hasta.' },
    ],
    responses: { 200: { description: 'Datos agregados por grado.' } },
  },
  {
    method: 'GET',
    path: '/AISentinelAdmin/v1/statistics/students',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Top estudiantes con más infracciones.',
    query: [
      { name: 'from', type: 'date', required: false, description: 'Desde.' },
      { name: 'to', type: 'date', required: false, description: 'Hasta.' },
      { name: 'limit', type: 'number', required: false, description: 'Top N (default 10).' },
    ],
    responses: { 200: { description: 'Array top.' } },
  },
  {
    method: 'GET',
    path: '/AISentinelAdmin/v1/statistics/objects',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Conteo por tipo de objeto detectado.',
    responses: { 200: { description: 'Conteos.' } },
  },
  {
    method: 'GET',
    path: '/AISentinelAdmin/v1/statistics/days',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Serie temporal de alertas por día.',
    query: [
      { name: 'from', type: 'date', required: false, description: 'Desde.' },
      { name: 'to', type: 'date', required: false, description: 'Hasta.' },
    ],
    responses: { 200: { description: 'Serie diaria.' } },
  },
  {
    method: 'POST',
    path: '/AISentinelAdmin/v1/statistics/grades/export',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Exporta reporte por grado (PDF/email).',
    body: [
      {
        name: 'email',
        type: 'string',
        required: false,
        description: 'Si está, envía PDF y responde JSON.',
      },
      { name: 'format', type: 'string', required: false, description: 'pdf (default).' },
      { name: 'sections', type: 'string[]', required: false, description: 'Secciones.' },
    ],
    responses: { 200: { description: 'PDF binario o confirmación de email.' } },
  },
  {
    method: 'POST',
    path: '/AISentinelAdmin/v1/statistics/students/export',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Exporta top estudiantes.',
    body: 'Mismo que grades/export.',
    responses: { 200: { description: 'PDF o email.' } },
  },
  {
    method: 'POST',
    path: '/AISentinelAdmin/v1/statistics/objects/export',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Exporta objetos.',
    body: 'Mismo que grades/export.',
    responses: { 200: { description: 'PDF o email.' } },
  },
  {
    method: 'POST',
    path: '/AISentinelAdmin/v1/statistics/days/export',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Exporta serie diaria.',
    body: 'Mismo que grades/export.',
    responses: { 200: { description: 'PDF o email.' } },
  },
];

const audits = [
  {
    method: 'GET',
    path: '/AISentinelAdmin/v1/audits/get',
    auth: 'JWT',
    roles: ['ADMIN_ROLE'],
    description: 'Bitácora de auditoría.',
    query: [
      { name: 'page', type: 'number', required: false, description: 'Página.' },
      { name: 'limit', type: 'number', required: false, description: 'Resultados.' },
      {
        name: 'action',
        type: 'string',
        required: false,
        description: 'POST | PUT | DELETE | PATCH.',
      },
      { name: 'entity', type: 'string', required: false, description: 'Entidad.' },
      { name: 'userId', type: 'string', required: false, description: 'Usuario.' },
      { name: 'from', type: 'date', required: false, description: 'Desde.' },
      { name: 'to', type: 'date', required: false, description: 'Hasta.' },
    ],
    responses: { 200: { description: 'Página de logs.' } },
  },
];

const notifications = [
  {
    method: 'GET',
    path: '/AISentinelAdmin/v1/notifications',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Notificaciones del usuario.',
    query: [
      { name: 'page', type: 'number', required: false, description: 'Página.' },
      { name: 'limit', type: 'number', required: false, description: 'Resultados.' },
      { name: 'unreadOnly', type: 'boolean', required: false, description: 'Solo no leídas.' },
    ],
    responses: { 200: { description: 'Página.' } },
  },
  {
    method: 'GET',
    path: '/AISentinelAdmin/v1/notifications/unread-count',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Conteo de no leídas (badge).',
    responses: { 200: { description: 'Conteo.', example: { count: 5 } } },
  },
  {
    method: 'POST',
    path: '/AISentinelAdmin/v1/notifications/mark-read',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Marca todas como leídas.',
    responses: { 200: { description: 'Marcadas.', example: { updated: 5 } } },
  },
];

const preferences = [
  {
    method: 'GET',
    path: '/AISentinelAdmin/v1/preferences/alerts',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Preferencias de alertas del usuario.',
    responses: {
      200: {
        description: 'Preferencias.',
        example: { emailEnabled: true, smsEnabled: false, cooldownMinutes: 30 },
      },
      404: { description: 'Sin preferencias todavía.' },
    },
  },
  {
    method: 'PUT',
    path: '/AISentinelAdmin/v1/preferences/alerts',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Crea o actualiza preferencias.',
    body: [
      { name: 'emailEnabled', type: 'boolean', required: false, description: 'Habilitar email.' },
      { name: 'smsEnabled', type: 'boolean', required: false, description: 'Habilitar SMS.' },
      { name: 'contactEmail', type: 'string', required: false, description: 'Email destino.' },
      { name: 'contactPhone', type: 'string', required: false, description: 'Teléfono destino.' },
      {
        name: 'cooldownMinutes',
        type: 'number',
        required: false,
        description: 'Cooldown entre alertas para el mismo estudiante.',
      },
    ],
    responses: { 200: { description: 'Guardadas.' } },
  },
];

const adminTools = [
  {
    method: 'GET',
    path: '/AISentinelAdmin/v1/admin/pyimage-status',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Estado del monitor de salud de pyimage.',
    responses: {
      200: {
        description: 'Estado.',
        example: { connected: true, lastCheck: '...', lastOk: '...' },
      },
      503: { description: 'Monitor no inicializado.' },
    },
  },
  {
    method: 'GET',
    path: '/AISentinelAdmin/v1/admin/chroma-status',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Conteo de embeddings en ChromaDB.',
    responses: { 200: { description: 'Conteos.', example: { faces: 320, uniforms: 24 } } },
  },
  {
    method: 'POST',
    path: '/AISentinelAdmin/v1/admin/test-detection',
    auth: 'JWT',
    roles: ['ADMIN_ROLE'],
    rateLimit: 'frameUploadLimit',
    description: 'Validación manual del modelo. Hasta 10 imágenes. No genera alertas.',
    body: [
      {
        name: 'images',
        type: 'file[]',
        required: true,
        description: 'Hasta 10 imágenes JPG/PNG/WebP (≤10MB c/u).',
      },
      { name: 'mode', type: 'string', required: false, description: 'clothing (default) | full.' },
    ],
    responses: {
      200: { description: 'Array de resultados por imagen.' },
      400: { description: 'Sin imágenes.' },
      502: { description: 'Error de pyimage.' },
    },
  },
];

const models3d = [
  {
    method: 'GET',
    path: '/AISentinelAdmin/v1/models3d/get',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Lista modelos 3D del personalizador.',
    query: [
      { name: 'page', type: 'number', required: false, description: 'Página.' },
      { name: 'limit', type: 'number', required: false, description: 'Resultados.' },
      { name: 'isActive', type: 'boolean', required: false, description: 'Solo activos.' },
    ],
    responses: { 200: { description: 'Página de modelos.' } },
  },
  {
    method: 'GET',
    path: '/AISentinelAdmin/v1/models3d/:id',
    auth: 'JWT',
    roles: ['ADMIN_ROLE', 'COORDINATOR_ROLE'],
    description: 'Detalle de un modelo.',
    pathParams: [{ name: 'id', type: 'ObjectId', required: true, description: '_id.' }],
    responses: { 200: { description: 'Modelo.' }, 404: { description: 'No existe.' } },
  },
  {
    method: 'POST',
    path: '/AISentinelAdmin/v1/models3d/create',
    auth: 'JWT',
    roles: ['ADMIN_ROLE'],
    description: 'Sube archivo .glb/.gltf.',
    body: [
      { name: 'name', type: 'string', required: true, description: 'Nombre único.' },
      { name: 'description', type: 'string', required: false, description: 'Descripción.' },
      { name: 'file', type: 'file', required: true, description: 'Modelo .glb o .gltf.' },
    ],
    responses: { 201: { description: 'Creado.' } },
  },
  {
    method: 'PUT',
    path: '/AISentinelAdmin/v1/models3d/:id',
    auth: 'JWT',
    roles: ['ADMIN_ROLE'],
    description: 'Actualiza metadatos (no el archivo).',
    pathParams: [{ name: 'id', type: 'ObjectId', required: true, description: '_id.' }],
    body: 'Cualquier campo del Model3D.',
    responses: { 200: { description: 'Actualizado.' } },
  },
  {
    method: 'PUT',
    path: '/AISentinelAdmin/v1/models3d/:id/activate',
    auth: 'JWT',
    roles: ['ADMIN_ROLE'],
    description: 'Activa.',
    pathParams: [{ name: 'id', type: 'ObjectId', required: true, description: '_id.' }],
    responses: { 200: { description: 'Activado.' } },
  },
  {
    method: 'PUT',
    path: '/AISentinelAdmin/v1/models3d/:id/deactivate',
    auth: 'JWT',
    roles: ['ADMIN_ROLE'],
    description: 'Desactiva.',
    pathParams: [{ name: 'id', type: 'ObjectId', required: true, description: '_id.' }],
    responses: { 200: { description: 'Desactivado.' } },
  },
  {
    method: 'DELETE',
    path: '/AISentinelAdmin/v1/models3d/:id',
    auth: 'JWT',
    roles: ['ADMIN_ROLE'],
    description: 'Elimina registro + archivo físico.',
    pathParams: [{ name: 'id', type: 'ObjectId', required: true, description: '_id.' }],
    responses: { 200: { description: 'Eliminado.' } },
  },
];

export {
  alerts,
  attendance,
  inspections,
  statistics,
  audits,
  notifications,
  preferences,
  adminTools,
  models3d,
};
