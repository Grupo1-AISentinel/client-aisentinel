import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../utils/cn.js';

const mulberry32 = (seed) => {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const buildPoints = (count, width, height, seed) => {
  const rand = mulberry32(seed);
  const points = [];
  const margin = 40;
  for (let i = 0; i < count; i += 1) {
    const x = margin + rand() * (width - margin * 2);
    const y = margin + rand() * (height - margin * 2);
    const radius = 0.6 + rand() * 1.6;
    const size = radius > 1.4 ? 'lg' : radius > 0.9 ? 'md' : 'sm';
    points.push({
      id: i,
      cx: x,
      cy: y,
      r: radius,
      size,
      delay: rand() * 7,
      duration: 3 + rand() * 5,
      driftX: (rand() - 0.5) * 30,
      driftY: (rand() - 0.5) * 30,
      driftDuration: 60 + rand() * 40,
    });
  }
  return points;
};

const buildConnections = (points, maxDistance) => {
  const lines = [];
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const a = points[i];
      const b = points[j];
      const dx = a.cx - b.cx;
      const dy = a.cy - b.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= maxDistance) {
        const opacity = Math.max(0.05, 0.32 * (1 - dist / maxDistance));
        lines.push({ key: `${a.id}-${b.id}`, a, b, opacity });
      }
    }
  }
  return lines;
};

const ConstellationBackground = ({ className, seed = 7, maxDistance = 140 }) => {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 1600, height: 900 });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;
    const update = () => {
      const rect = node.getBoundingClientRect();
      setSize({
        width: rect.width || window.innerWidth,
        height: rect.height || window.innerHeight,
      });
    };
    update();
    let timeoutId;
    const onResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(update, 200);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const isMobile = size.width < 768;
  const isTablet = size.width >= 768 && size.width < 1280;
  const pointCount = isMobile ? 30 : isTablet ? 50 : 80;
  const connectionDistance = isMobile ? 90 : isTablet ? 110 : maxDistance;

  const points = useMemo(
    () => buildPoints(pointCount, size.width, size.height, seed),
    [pointCount, size.width, size.height, seed]
  );
  const connections = useMemo(
    () => buildConnections(points, connectionDistance),
    [points, connectionDistance]
  );

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}
      aria-hidden
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size.width} ${size.height}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0"
      >
        {connections.map((line) => (
          <line
            key={line.key}
            x1={line.a.cx}
            y1={line.a.cy}
            x2={line.b.cx}
            y2={line.b.cy}
            stroke="rgba(192, 198, 219, 0.18)"
            strokeWidth="0.6"
            style={{ opacity: line.opacity }}
          />
        ))}
        {points.map((p) => (
          <g key={p.id}>
            <circle
              cx={p.cx}
              cy={p.cy}
              r={p.r * 3.5}
              fill="rgba(235, 194, 70, 0.05)"
              className="constellation-glow"
              style={{ animationDelay: `${p.delay}s` }}
            />
            <circle
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              fill="rgba(235, 194, 70, 0.95)"
              className="constellation-star"
              style={{
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                ['--drift-x']: `${p.driftX}px`,
                ['--drift-y']: `${p.driftY}px`,
                ['--drift-duration']: `${p.driftDuration}s`,
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default ConstellationBackground;
