import { authEndpoints } from './endpoints.auth.js';
import { adminEndpoints } from './endpoints.admin.js';
import { pyimageEndpoints } from './endpoints.pyimage.js';
import { flows } from './flows.js';

export const searchIndex = [
  ...authEndpoints.map((e) => ({
    type: 'endpoint',
    tab: 'auth',
    title: `${e.method} ${e.path}`,
    description: e.description,
    path: e.path,
  })),
  ...adminEndpoints.map((e) => ({
    type: 'endpoint',
    tab: 'admin',
    title: `${e.method} ${e.path}`,
    description: e.description,
    path: e.path,
  })),
  ...pyimageEndpoints.map((e) => ({
    type: 'endpoint',
    tab: 'pyimage',
    title: `${e.method} ${e.path}`,
    description: e.description,
    path: e.path,
  })),
  ...flows.map((f) => ({
    type: 'flow',
    tab: 'flows',
    title: f.title,
    description: f.summary,
    path: f.id,
  })),
  {
    type: 'section',
    tab: 'architecture',
    title: 'Arquitectura',
    description: 'Visión del sistema.',
    path: 'architecture',
  },
  {
    type: 'section',
    tab: 'dataModels',
    title: 'Modelos de datos',
    description: 'Esquemas Mongo/PG/Chroma.',
    path: 'dataModels',
  },
  {
    type: 'section',
    tab: 'socket',
    title: 'Eventos Socket.IO',
    description: 'Catálogo de eventos.',
    path: 'socket',
  },
  {
    type: 'section',
    tab: 'env',
    title: 'Variables de entorno',
    description: 'Config de los 3 servicios.',
    path: 'env',
  },
];
