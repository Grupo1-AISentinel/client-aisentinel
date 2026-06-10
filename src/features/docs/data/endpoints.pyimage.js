export const pyimageEndpoints = [
  {
    method: 'GET',
    path: '/health',
    auth: 'Público',
    description: 'Health check. Usado por docker-compose healthcheck.',
    responses: {
      200: {
        description: 'Servicio sano.',
        example: { status: 'healthy', version: '2.0.0', gpu: 'NVIDIA RTX 3060', fp16: true },
      },
    },
  },
  {
    method: 'GET',
    path: '/chroma-status',
    auth: 'x-internal-api-key',
    description: 'Cuenta embeddings en ChromaDB.',
    responses: {
      200: { description: 'Conteos.', example: { faces: 320, uniforms: 24 } },
      401: { description: 'API key inválida.' },
    },
  },
  {
    method: 'POST',
    path: '/register',
    auth: 'x-internal-api-key',
    description: 'Endpoint legacy de registro (multipart).',
    body: [
      { name: 'card', type: 'string', required: true, description: 'Carnet.' },
      { name: 'fotos', type: 'file[]', required: true, description: 'Fotos para registro.' },
    ],
    responses: { 200: { description: 'Aceptado.' } },
    notes: 'Se prefiere /api/students/register (base64 en JSON).',
  },
  {
    method: 'POST',
    path: '/api/students/register',
    auth: 'x-internal-api-key',
    description: 'Registra embeddings faciales con fotos en base64.',
    body: [
      { name: 'carnet', type: 'string', required: true, description: 'Carnet único.' },
      { name: 'nombre', type: 'string', required: true, description: 'Nombre completo.' },
      { name: 'fotos', type: 'string[]', required: true, description: 'Array de imágenes base64.' },
    ],
    responses: {
      200: {
        description: 'Embeddings registrados.',
        example: { carnet: '2024001', status: 'success' },
      },
      400: { description: 'Sin imágenes válidas o sin rostro detectado.' },
    },
    usedBy: ['server-admin-aisentinel/src/students/student.controller.js#createStudent'],
  },
  {
    method: 'POST',
    path: '/register/uniform',
    auth: 'x-internal-api-key',
    description: 'Registra embeddings de prendas (soporta paths o base64).',
    body: [
      { name: 'item_id', type: 'string', required: true, description: 'ID único.' },
      {
        name: 'item_type',
        type: 'string',
        required: true,
        description: 'JACKET | TSHIRT | PANTS.',
      },
      {
        name: 'images',
        type: '(string | path)[]',
        required: true,
        description: 'Imágenes base64 o paths.',
      },
    ],
    responses: {
      200: { description: 'Embeddings registrados.' },
      400: { description: 'Sin imágenes válidas.' },
    },
    usedBy: ['server-pyimage-aisentinel/server/scripts/seed_uniform.py'],
  },
  {
    method: 'POST',
    path: '/api/detect',
    auth: 'x-internal-api-key',
    description: 'Detecta y reconoce estudiantes en un frame.',
    body: [
      { name: 'file', type: 'file', required: true, description: 'Imagen JPEG/PNG/WebP.' },
      {
        name: 'camera_id',
        type: 'string',
        required: false,
        description: 'ID cámara (query o form).',
      },
      { name: 'location', type: 'string', required: false, description: 'Ubicación humana.' },
    ],
    responses: {
      200: {
        description: 'Frame procesado.',
        example: {
          status: 'Procesado',
          students: [
            {
              student_id: '2024001',
              identity: 'Juan Pérez',
              location: [120, 340, 280, 180],
              faceBox: { top: 120, right: 340, bottom: 280, left: 180 },
              has_uniform: true,
              has_accessory: false,
              is_new_attendance: true,
            },
          ],
        },
      },
    },
    usedBy: [
      'server-admin-aisentinel/src/cameras/camera.controller.js#uploadFrame',
      'server-admin-aisentinel/src/admin/admin.routes.js#test-detection',
    ],
  },
  {
    method: 'POST',
    path: '/api/detect/batch',
    auth: 'x-internal-api-key',
    description: 'Variante batch del detect. Hasta 10 imágenes.',
    body: [
      { name: 'files', type: 'file[]', required: true, description: 'Hasta 10 imágenes.' },
      { name: 'camera_id', type: 'string', required: false, description: 'ID cámara.' },
      { name: 'location', type: 'string', required: false, description: 'Ubicación.' },
    ],
    responses: {
      200: { description: 'Array de resultados (uno por imagen).' },
      400: { description: 'Más de 10 archivos.' },
    },
    usedBy: ['server-admin-aisentinel/src/admin/admin.routes.js#test-detection'],
  },
  {
    method: 'POST',
    path: '/inspeccion/toggle',
    auth: 'x-internal-api-key',
    description: 'Activa/desactiva globalmente la inspección de uniformes.',
    body: [{ name: 'activar', type: 'boolean', required: true, description: 'true | false.' }],
    responses: {
      200: { description: 'Estado actualizado.', example: { status: 'success', activado: true } },
    },
  },
];

export const pyimageGroups = [
  { id: 'health', title: 'Salud y estado', description: 'Health check + estado de ChromaDB.' },
  { id: 'register', title: 'Registro de datos', description: 'Endpoints para poblar ChromaDB.' },
  { id: 'detect', title: 'Detección', description: 'Endpoints de inferencia (single y batch).' },
  { id: 'config', title: 'Configuración runtime', description: 'Toggle de inspección.' },
];

export const groupPyimageEndpoints = (endpoints) => {
  const grouped = pyimageGroups.map((g) => ({ ...g, endpoints: [] }));
  endpoints.forEach((ep) => {
    const p = ep.path.toLowerCase();
    let id = 'health';
    if (p.includes('/register')) id = 'register';
    else if (p.includes('/detect')) id = 'detect';
    else if (p.includes('/inspeccion') || p.includes('/toggle')) id = 'config';
    grouped.find((g) => g.id === id)?.endpoints.push(ep);
  });
  return grouped;
};
