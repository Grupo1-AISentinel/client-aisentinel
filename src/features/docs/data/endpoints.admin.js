import { students, coordinators, uniforms, cameras } from './endpoints.admin.core.js';
import {
  alerts,
  attendance,
  inspections,
  statistics,
  audits,
  notifications,
  preferences,
  adminTools,
  models3d,
} from './endpoints.admin.misc.js';

export const adminEndpoints = [
  ...students,
  ...coordinators,
  ...uniforms,
  ...cameras,
  ...alerts,
  ...attendance,
  ...inspections,
  ...statistics,
  ...audits,
  ...notifications,
  ...preferences,
  ...adminTools,
  ...models3d,
];

export const adminGroups = [
  { id: 'students', title: 'Estudiantes', description: 'CRUD + sync interno + bulk.' },
  { id: 'coordinators', title: 'Coordinadores', description: 'CRUD + creación de admin.' },
  { id: 'uniforms', title: 'Uniformes', description: 'CRUD + thumbnails + seeder interno.' },
  {
    id: 'cameras',
    title: 'Cámaras',
    description: 'CRUD + upload de frames para detección en vivo.',
  },
  { id: 'alerts', title: 'Alertas', description: 'Generación automática + consulta + simulación.' },
  { id: 'attendance', title: 'Asistencias', description: 'Registro automático + consulta diaria.' },
  {
    id: 'inspections',
    title: 'Inspecciones',
    description: 'Toggle on/off de inspección por grado.',
  },
  { id: 'statistics', title: 'Estadísticas', description: 'Agregaciones + export PDF/email.' },
  { id: 'audits', title: 'Bitácoras', description: 'Auditoría de cambios (solo ADMIN).' },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Inbox + unread count + mark-read.',
  },
  { id: 'preferences', title: 'Preferencias', description: 'AlertPreferences del usuario.' },
  { id: 'admin', title: 'Admin tools', description: 'Estado pyimage/chroma + test-detection.' },
  {
    id: 'models3d',
    title: 'Modelos 3D',
    description: 'CRUD de assets glTF para el personalizador.',
  },
];

const prefixToGroup = {
  '/students': 'students',
  '/coordinators': 'coordinators',
  '/uniforms': 'uniforms',
  '/cameras': 'cameras',
  '/alerts': 'alerts',
  '/attendance': 'attendance',
  '/inspections': 'inspections',
  '/statistics': 'statistics',
  '/audits': 'audits',
  '/notifications': 'notifications',
  '/preferences': 'preferences',
  '/admin/': 'admin',
  '/admin': 'admin',
  '/models3d': 'models3d',
};

export const groupAdminEndpoints = (endpoints) => {
  const grouped = adminGroups.map((g) => ({ ...g, endpoints: [] }));
  endpoints.forEach((ep) => {
    const p = ep.path.replace('/AISentinelAdmin/v1', '');
    let id = null;
    Object.keys(prefixToGroup).forEach((prefix) => {
      if (p.startsWith(prefix)) id = prefixToGroup[prefix];
    });
    grouped.find((g) => g.id === id)?.endpoints.push(ep);
  });
  return grouped;
};
