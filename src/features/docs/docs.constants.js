import {
  ArchitectureIcon,
  ShieldIcon,
  ServerIcon,
  BrainIcon,
  DataIcon,
  SocketIcon,
  FlowIcon,
  ConfigIcon,
} from '../../shared/components/docs/index.js';

export const DOCS_SECTIONS = [
  { id: 'architecture', label: 'Arquitectura', Icon: ArchitectureIcon },
  { id: 'auth', label: 'Auth API', Icon: ShieldIcon },
  { id: 'admin', label: 'Admin API', Icon: ServerIcon },
  { id: 'pyimage', label: 'Pyimage API', Icon: BrainIcon },
  { id: 'dataModels', label: 'Modelos', Icon: DataIcon },
  { id: 'socket', label: 'Socket.IO', Icon: SocketIcon },
  { id: 'flows', label: 'Flujos', Icon: FlowIcon },
  { id: 'env', label: 'Config', Icon: ConfigIcon },
];
