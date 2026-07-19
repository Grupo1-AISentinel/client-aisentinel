import { useState } from 'react';
import { cn } from '../../utils/cn.js';

const NODES = [
  {
    id: 'frontend',
    x: 40,
    y: 50,
    w: 150,
    h: 80,
    label: 'Frontend',
    sub: 'React 18 · Vite',
    kind: 'client',
  },
  {
    id: 'admin',
    x: 290,
    y: 50,
    w: 170,
    h: 80,
    label: 'Admin API',
    sub: 'Express · Mongoose',
    kind: 'core',
  },
  {
    id: 'auth',
    x: 560,
    y: 50,
    w: 150,
    h: 80,
    label: 'Auth API',
    sub: 'Express · Sequelize',
    kind: 'service',
  },
  {
    id: 'pyimage',
    x: 290,
    y: 200,
    w: 170,
    h: 80,
    label: 'Pyimage',
    sub: 'FastAPI · YOLO',
    kind: 'core',
  },
  {
    id: 'mongo',
    x: 560,
    y: 200,
    w: 150,
    h: 70,
    label: 'MongoDB',
    sub: 'Estudiantes · Alertas',
    kind: 'store',
  },
  {
    id: 'postgres',
    x: 560,
    y: 290,
    w: 150,
    h: 70,
    label: 'PostgreSQL',
    sub: 'Usuarios · Roles · 2FA',
    kind: 'store',
  },
  {
    id: 'chroma',
    x: 40,
    y: 200,
    w: 150,
    h: 70,
    label: 'ChromaDB',
    sub: 'Embeddings vectores',
    kind: 'store',
  },
  {
    id: 'cloudinary',
    x: 40,
    y: 290,
    w: 150,
    h: 70,
    label: 'Cloudinary',
    sub: 'Assets · CDN',
    kind: 'store',
  },
];

const EDGES = [
  { from: 'frontend', to: 'admin', label: 'REST + JWT', type: 'http' },
  { from: 'frontend', to: 'admin', label: 'Socket.IO', type: 'socket', curve: -1 },
  { from: 'admin', to: 'auth', label: 'JWT verify', type: 'http' },
  { from: 'admin', to: 'pyimage', label: 'HTTP proxy', type: 'http' },
  { from: 'admin', to: 'mongo', label: 'Mongoose', type: 'db' },
  { from: 'admin', to: 'cloudinary', label: 'Upload', type: 'file' },
  { from: 'auth', to: 'postgres', label: 'Sequelize', type: 'db' },
  { from: 'pyimage', to: 'chroma', label: 'embeddings', type: 'db' },
];

const FILL = {
  client: '#1c2b3c',
  core: '#122131',
  service: '#1c2b3c',
  store: '#0c1619',
};
const STROKE = {
  client: 'rgba(143,188,250,0.6)',
  core: 'rgba(245,197,58,0.7)',
  service: 'rgba(143,188,250,0.6)',
  store: 'rgba(127,219,164,0.6)',
};
const LABEL = {
  client: '#8fbcfa',
  core: '#F2C94C',
  service: '#8fbcfa',
  store: '#7fdba4',
};
const EDGE_COLOR = {
  http: '#F2C94C',
  socket: '#8fbcfa',
  db: '#7fdba4',
  file: '#bbc6e7',
};

const getNode = (id) => NODES.find((n) => n.id === id);

const edgeEndpoints = (edge) => {
  const from = getNode(edge.from);
  const to = getNode(edge.to);
  if (!from || !to) return null;
  const fromX = edge.from === 'admin' && edge.to === 'auth' ? from.x : from.x + from.w;
  const fromY = from.y + from.h / 2;
  const toX =
    edge.to === 'admin' ||
    edge.to === 'mongo' ||
    edge.to === 'postgres' ||
    edge.to === 'chroma' ||
    edge.to === 'cloudinary'
      ? to.x
      : to.x + to.w;
  const toY = to.y + to.h / 2;
  return { fromX, fromY, toX, toY };
};

const buildEdgePath = (edge) => {
  const pts = edgeEndpoints(edge);
  if (!pts) return '';
  const { fromX, fromY, toX, toY } = pts;
  const curve = edge.curve || 0;
  const midX = (fromX + toX) / 2;
  return `M ${fromX} ${fromY} C ${midX + curve * 30} ${fromY}, ${midX + curve * 30} ${toY}, ${toX} ${toY}`;
};

const ArchDiagram = ({ className }) => {
  const [activeId, setActiveId] = useState(null);

  const visibleEdges = activeId
    ? EDGES.filter((e) => e.from === activeId || e.to === activeId)
    : EDGES;

  return (
    <div
      className={cn(
        'rounded-lg border border-white/10 bg-black/30 p-3 md:p-4 overflow-x-auto',
        className
      )}
    >
      <svg
        viewBox="0 0 750 380"
        className="w-full min-w-[700px] h-auto"
        role="img"
        aria-label="Diagrama de arquitectura de AISentinel"
      >
        <defs>
          <marker
            id="archArrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
          </marker>
        </defs>

        {visibleEdges.map((edge, i) => {
          const pts = edgeEndpoints(edge);
          if (!pts) return null;
          const { fromX, fromY, toX, toY } = pts;
          const midX = (fromX + toX) / 2 + (edge.curve || 0) * 30;
          const midY = (fromY + toY) / 2;
          const color = EDGE_COLOR[edge.type];
          return (
            <g key={i} style={{ color, opacity: 1, transition: 'opacity 0.2s' }}>
              <path
                d={buildEdgePath(edge)}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray={edge.type === 'socket' ? '4 3' : 'none'}
                markerEnd="url(#archArrow)"
              />
              <g transform={`translate(${midX}, ${midY})`}>
                <rect
                  x="-32"
                  y="-8"
                  width="64"
                  height="16"
                  rx="3"
                  fill="rgba(11,18,33,0.95)"
                  stroke="currentColor"
                  strokeWidth="0.6"
                  strokeOpacity="0.3"
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize="9"
                  fontWeight="600"
                  fontFamily="ui-monospace, monospace"
                >
                  {edge.label}
                </text>
              </g>
            </g>
          );
        })}

        {NODES.map((node) => {
          const isActive = activeId === node.id;
          const isDim = activeId && !isActive;
          return (
            <g
              key={node.id}
              style={{
                cursor: 'pointer',
                opacity: isDim ? 0.3 : 1,
                transition: 'opacity 0.2s',
              }}
              onClick={() => setActiveId(isActive ? null : node.id)}
              onMouseEnter={() => setActiveId(node.id)}
              onMouseLeave={() => setActiveId(null)}
            >
              <rect
                x={node.x}
                y={node.y}
                width={node.w}
                height={node.h}
                rx="8"
                fill={FILL[node.kind]}
                stroke={STROKE[node.kind]}
                strokeWidth={isActive ? 2 : 1.2}
                style={{
                  filter: isActive ? 'drop-shadow(0 0 8px rgba(245,197,58,0.5))' : 'none',
                }}
              />
              <text
                x={node.x + 12}
                y={node.y + 26}
                fill={LABEL[node.kind]}
                fontSize="13"
                fontWeight="700"
                fontFamily="'Hanken Grotesk', sans-serif"
              >
                {node.label}
              </text>
              <text
                x={node.x + 12}
                y={node.y + 44}
                fill="#c6c6cd"
                fontSize="10"
                fontFamily="'Geist', sans-serif"
              >
                {node.sub}
              </text>
              {isActive && (
                <circle cx={node.x + node.w - 12} cy={node.y + 12} r="3" fill="#7fdba4" />
              )}
            </g>
          );
        })}
      </svg>

      <p className="mt-3 text-[11px] text-on-surface-dim text-center">
        Pasa el cursor sobre un nodo para resaltar sus conexiones.
      </p>
    </div>
  );
};

export default ArchDiagram;
