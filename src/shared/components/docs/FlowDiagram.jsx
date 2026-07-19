import { useState } from 'react';
import { cn } from '../../utils/cn.js';

const LANE_ORDER = [
  'user',
  'frontend',
  'admin',
  'auth',
  'pyimage',
  'mongo',
  'chroma',
  'cloudinary',
  'postgres',
];

const nodeFill = {
  user: '#1c1a14',
  frontend: '#1c2b3c',
  admin: '#122131',
  auth: '#1c2b3c',
  pyimage: '#1f1810',
  mongo: '#0c1619',
  chroma: '#0c1619',
  cloudinary: '#0c1619',
  postgres: '#0c1619',
};
const nodeStroke = {
  user: 'rgba(255,212,121,0.6)',
  frontend: 'rgba(143,188,250,0.6)',
  admin: 'rgba(245,197,58,0.7)',
  auth: 'rgba(143,188,250,0.6)',
  pyimage: 'rgba(245,197,58,0.7)',
  mongo: 'rgba(127,219,164,0.5)',
  chroma: 'rgba(127,219,164,0.5)',
  cloudinary: 'rgba(187,198,231,0.5)',
  postgres: 'rgba(127,219,164,0.5)',
};
const labelFill = {
  user: '#ffd479',
  frontend: '#8fbcfa',
  admin: '#F2C94C',
  auth: '#8fbcfa',
  pyimage: '#F2C94C',
  mongo: '#7fdba4',
  chroma: '#7fdba4',
  cloudinary: '#bbc6e7',
  postgres: '#7fdba4',
};
const stepColor = {
  http: '#F2C94C',
  socket: '#8fbcfa',
  db: '#7fdba4',
  auth: '#c0c6db',
  file: '#bbc6e7',
};

export const stepLabel = { http: 'HTTP', socket: 'Socket', db: 'DB', auth: 'Auth', file: 'File' };

const computeLayout = (steps) => {
  const used = new Set();
  steps.forEach((s) => used.add(s.from) || used.add(s.to));
  if (used.has('admin')) used.add('mongo') && used.add('cloudinary');
  if (used.has('auth')) used.add('postgres');
  if (used.has('pyimage')) used.add('chroma');
  const activeLanes = LANE_ORDER.filter((l) => used.has(l));
  const laneY = (lane) => 70 + activeLanes.indexOf(lane) * 60;
  return { activeLanes, laneY };
};

const FlowDiagram = ({ steps, className }) => {
  const [hovered, setHovered] = useState(null);
  const { activeLanes, laneY } = computeLayout(steps);
  const laneWidth = 120;
  const startX = 130;
  const stepGap = 90;
  const totalWidth = startX + activeLanes.length * laneWidth + steps.length * stepGap;
  const totalHeight = laneY(activeLanes[activeLanes.length - 1]) + 40;
  const laneCenter = (lane) => startX + activeLanes.indexOf(lane) * laneWidth + laneWidth / 2;

  return (
    <div
      className={cn(
        'rounded-lg border border-white/10 bg-black/30 p-3 md:p-4 overflow-x-auto',
        className
      )}
    >
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="w-full min-w-[700px] h-auto"
        role="img"
        aria-label="Diagrama de secuencia"
      >
        <defs>
          <marker
            id="seqArrow"
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

        {activeLanes.map((lane) => (
          <g key={lane}>
            <line
              x1={laneCenter(lane)}
              y1={laneY(lane) - 26}
              x2={laneCenter(lane)}
              y2={totalHeight - 20}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <rect
              x={laneCenter(lane) - 60}
              y={laneY(lane) - 24}
              width={120}
              height={28}
              rx={6}
              fill={nodeFill[lane]}
              stroke={nodeStroke[lane]}
              strokeWidth="1.2"
            />
            <text
              x={laneCenter(lane)}
              y={laneY(lane) - 6}
              textAnchor="middle"
              fill={labelFill[lane]}
              fontSize="11"
              fontWeight="700"
              fontFamily="'Hanken Grotesk', sans-serif"
            >
              {lane}
            </text>
          </g>
        ))}

        {steps.map((s, i) => {
          const fromX = laneCenter(s.from) + 60;
          const toX = laneCenter(s.to) - 60;
          const x = startX + activeLanes.length * laneWidth + i * stepGap;
          const yMid = (laneY(s.from) + laneY(s.to)) / 2;
          const color = stepColor[s.type] || '#F2C94C';
          const isHovered = hovered === i;
          const isDim = hovered !== null && !isHovered;
          return (
            <g
              key={i}
              style={{
                color,
                opacity: isDim ? 0.2 : 1,
                transition: 'opacity 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <path
                d={`M ${fromX} ${laneY(s.from)} C ${x} ${laneY(s.from)}, ${x} ${laneY(s.to)}, ${toX} ${laneY(s.to)}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={isHovered ? 2 : 1.3}
                markerEnd="url(#seqArrow)"
              />
              <g transform={`translate(${x}, ${yMid})`}>
                <circle r="10" fill="rgba(11,18,33,0.95)" stroke="currentColor" strokeWidth="1.2" />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize="9"
                  fontWeight="700"
                  fontFamily="ui-monospace, monospace"
                >
                  {i + 1}
                </text>
              </g>
              <rect
                x={x - 60}
                y={yMid + 14}
                width={120}
                height={s.detail ? 30 : 16}
                rx="3"
                fill="rgba(11,18,33,0.85)"
                stroke="currentColor"
                strokeWidth="0.6"
                strokeOpacity="0.3"
              />
              <text
                x={x}
                y={yMid + 25}
                textAnchor="middle"
                fill={color}
                fontSize="9.5"
                fontWeight="600"
                fontFamily="ui-monospace, monospace"
              >
                {s.label}
              </text>
              {s.detail && (
                <text
                  x={x}
                  y={yMid + 38}
                  textAnchor="middle"
                  fill="#8a8a92"
                  fontSize="8.5"
                  fontFamily="ui-monospace, monospace"
                >
                  {s.detail}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default FlowDiagram;
