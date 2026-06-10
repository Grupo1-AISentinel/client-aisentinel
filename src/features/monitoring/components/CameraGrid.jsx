import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  Video,
  Globe,
  Wifi,
  Square,
  LayoutGrid,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn.js';
import { CAMERA_SOURCE_LABELS } from '../../cameras/camera.constants.js';
import DetectionOverlay from './DetectionOverlay.jsx';
import LocalVideoPlayer from './LocalVideoPlayer.jsx';
import LiveBoundingBoxes from './LiveBoundingBoxes.jsx';
import { useDetectionStore } from '../stores/detectionStore.js';
import { scaleBox, scaleRect } from '../utils/scaleBox.js';
import { useCameraFrameUploader } from '../hooks/useCameraFrameUploader.js';

const SOURCE_ICON = {
  webcam: Camera,
  video: Video,
  ip: Globe,
  wifi: Wifi,
};

const STATUS_COLOR = {
  online: { dot: 'bg-success-bright', border: 'border-success/30' },
  offline: { dot: 'bg-on-surface-dim', border: 'border-white/10' },
};

const BoundingBoxes = ({ detection, renderSize, videoSize }) => {
  if (!detection) return null;
  const { faceBox, clothingBoxes = [] } = detection;
  const scaledFace = faceBox ? scaleBox(faceBox, videoSize, renderSize) : null;

  const scaledClothes = clothingBoxes
    .map((cb) => {
      const box = cb.box;
      if (!box) return null;
      const scaled = scaleRect(box, videoSize, renderSize);
      return scaled ? { ...cb, scaled } : null;
    })
    .filter(Boolean);

  if (!scaledFace && scaledClothes.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${renderSize.width} ${renderSize.height}`}
      preserveAspectRatio="none"
    >
      {scaledFace && (
        <g>
          <rect
            x={scaledFace.x}
            y={scaledFace.y}
            width={scaledFace.width}
            height={scaledFace.height}
            fill="none"
            stroke="var(--color-secondary)"
            strokeWidth="2.5"
            rx="4"
            style={{ filter: 'drop-shadow(0 0 4px rgba(235,194,70,0.6))' }}
          />
          <text
            x={scaledFace.x}
            y={scaledFace.y - 6}
            fill="var(--color-secondary)"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
            style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.8))' }}
          >
            {detection.studentCard || ''}
          </text>
        </g>
      )}
      {scaledClothes.map((cb, i) => {
        const stroke = cb.valid ? 'var(--color-success-bright)' : 'var(--color-error-bright)';
        return (
          <g key={i}>
            <rect
              x={cb.scaled.x}
              y={cb.scaled.y}
              width={cb.scaled.width}
              height={cb.scaled.height}
              fill="none"
              stroke={stroke}
              strokeWidth="1.5"
              strokeDasharray="4 2"
              rx="2"
              opacity="0.85"
            />
            <text
              x={cb.scaled.x}
              y={cb.scaled.y + cb.scaled.height + 12}
              fill={stroke}
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
              style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}
            >
              {(cb.class || '').toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const CameraTile = ({
  camera,
  size = 'md',
  onClick,
  selected,
  isActive = false,
  isFullscreen = false,
  onToggleFullscreen,
  detection,
  onDismissDetection,
}) => {
  const containerRef = useRef(null);
  const mediaRef = useRef(null);
  const [renderSize, setRenderSize] = useState({ width: 640, height: 480 });
  const cameraId = camera?.cameraId;
  const liveFrame = useDetectionStore((s) => (cameraId ? s.liveDetections[cameraId] : null));
  useCameraFrameUploader({
    cameraId,
    sourceRef: mediaRef,
    isActive: isActive || selected || isFullscreen,
  });

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const el = containerRef.current;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setRenderSize({ width: rect.width, height: rect.height });
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isFullscreen, size]);

  if (!camera) {
    return (
      <div
        ref={containerRef}
        className="glass-panel rounded-lg border border-dashed border-white/10 flex items-center justify-center min-h-[160px] sm:min-h-[200px] aspect-video"
      >
        <span className="text-on-surface-dim font-label text-[10px] uppercase">Sin cámara</span>
      </div>
    );
  }

  const Icon = SOURCE_ICON[camera.source] || Camera;
  const tone = STATUS_COLOR[camera.status] || STATUS_COLOR.offline;
  const isOnline = camera.status === 'online';
  const detectionVideoSize = detection?.videoSize;
  const liveVideoSize = liveFrame?.videoSize || null;

  return (
    <div
      ref={containerRef}
      className={cn(
        'glass-panel rounded-lg overflow-hidden flex flex-col text-left relative',
        'transition-all',
        isFullscreen
          ? 'border-secondary shadow-[0_0_24px_rgba(235,194,70,0.35)] w-full h-full'
          : 'hover:border-amber-400/40',
        tone.border,
        selected && !isFullscreen && 'border-secondary shadow-[0_0_12px_rgba(235,194,70,0.3)]'
      )}
    >
      <button
        type="button"
        onClick={() => onClick?.(camera)}
        className="relative flex-1 bg-surface-container-lowest aspect-video cursor-pointer overflow-hidden"
        aria-label={`Seleccionar ${camera.name || camera.cameraId}`}
      >
        {camera.source === 'webcam' || camera.source === 'video' || camera.source === 'ip' ? (
          <LocalVideoPlayer
            camera={camera}
            isActive={isActive || selected || isFullscreen}
            mediaRef={mediaRef}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center opacity-40">
            {isOnline ? (
              <Camera className="w-10 h-10 text-on-surface-dim" />
            ) : (
              <CameraOff className="w-10 h-10 text-on-surface-dim" />
            )}
          </div>
        )}

        <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-surface-overlay/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
          <span className={cn('w-1.5 h-1.5 rounded-full', tone.dot)} />
          <span className="text-[9px] font-label uppercase text-on-surface">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-surface-overlay/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
          <Icon className="w-3 h-3 text-secondary" />
          <span className="text-[9px] font-label uppercase text-on-surface">
            {CAMERA_SOURCE_LABELS[camera.source] || camera.source}
          </span>
        </div>

        {liveFrame && liveVideoSize && (
          <LiveBoundingBoxes
            cameraId={camera.cameraId}
            renderSize={renderSize}
            videoSize={liveVideoSize}
          />
        )}

        {detection && detectionVideoSize && (
          <BoundingBoxes
            detection={detection}
            renderSize={renderSize}
            videoSize={detectionVideoSize}
          />
        )}

        {isOnline && isActive && !detection && !liveFrame && (
          <div className="absolute bottom-2 left-2 z-10 text-[9px] font-label uppercase text-on-surface-variant">
            Cámara activa
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFullscreen?.(camera);
        }}
        className="absolute top-2 right-12 z-30 p-1.5 rounded-md bg-surface-overlay/80 text-on-surface hover:text-secondary hover:bg-amber-400/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        title={isFullscreen ? 'Salir (F o Esc)' : 'Pantalla completa (F)'}
        style={{ opacity: isFullscreen ? 1 : undefined }}
      >
        {isFullscreen ? (
          <Minimize2 className="w-3.5 h-3.5" />
        ) : (
          <Maximize2 className="w-3.5 h-3.5" />
        )}
      </button>

      {detection && (
        <div className="absolute top-12 right-2 z-30 flex flex-col gap-2 pointer-events-none group/det">
          <div className="pointer-events-auto">
            <DetectionOverlay detection={detection} onDismiss={onDismissDetection} />
          </div>
        </div>
      )}

      <div className="px-3 py-2 border-t border-white/5 bg-surface-container/40 shrink-0">
        <p className="text-xs font-semibold text-on-surface truncate">
          {camera.name || camera.cameraId}
        </p>
        <p className="text-[10px] text-on-surface-dim truncate font-mono">
          {camera.cameraId} · {camera.location || 'Sin ubicación'}
        </p>
      </div>
    </div>
  );
};

const LAYOUTS = [
  { value: 'single', label: '1', icon: Square, cols: 1 },
  { value: 'grid2', label: '2x2', icon: LayoutGrid, cols: 2 },
  { value: 'grid3', label: '3x3', icon: LayoutGrid, cols: 3 },
];

const CameraGrid = ({
  cameras,
  activeId,
  onSelect,
  layout,
  onLayoutChange,
  detectionsByCamera = {},
  onDismissDetection,
}) => {
  const [fullscreenCameraId, setFullscreenCameraId] = useState(null);
  const active = cameras.find((c) => c.cameraId === activeId) || cameras[0];

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      if (e.key === 'f' || e.key === 'F') {
        if (fullscreenCameraId) {
          setFullscreenCameraId(null);
        } else if (active) {
          setFullscreenCameraId(active.cameraId);
        }
      } else if (e.key === 'Escape' && fullscreenCameraId) {
        setFullscreenCameraId(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [fullscreenCameraId, active]);

  if (layout === 'single' || fullscreenCameraId) {
    const camera = fullscreenCameraId
      ? cameras.find((c) => c.cameraId === fullscreenCameraId)
      : active;
    const isFs = Boolean(fullscreenCameraId);
    return (
      <div className="flex flex-col gap-3 h-full">
        <div className="flex items-center justify-between">
          <div className="text-xs text-on-surface-dim font-label uppercase truncate">
            {camera
              ? `${camera.name || camera.cameraId} · ${camera.location || ''}`
              : 'Selecciona una cámara'}
            {isFs && (
              <span className="ml-2 text-secondary font-mono normal-case">· pantalla completa</span>
            )}
          </div>
          <LayoutSwitcher value={layout} onChange={onLayoutChange} />
        </div>
        <div
          className={cn('flex-1', isFs && 'fixed inset-4 z-50 bg-surface-container rounded-xl p-2')}
        >
          <CameraTile
            key="single-camera-tile"
            camera={camera}
            size={isFs ? 'lg' : 'lg'}
            onClick={onSelect}
            selected
            isActive
            isFullscreen={isFs}
            onToggleFullscreen={(c) => setFullscreenCameraId((prev) => (prev ? null : c.cameraId))}
            detection={camera ? detectionsByCamera[camera.cameraId] : null}
            onDismissDetection={onDismissDetection}
          />
        </div>
      </div>
    );
  }

  const slots = layout === 'grid2' ? 4 : 9;
  const cells = Array.from({ length: slots }, (_, i) => cameras[i] || null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-on-surface-dim font-label uppercase">
          Vista grid ({cells.filter(Boolean).length}/{slots})
        </div>
        <LayoutSwitcher value={layout} onChange={onLayoutChange} />
      </div>
      <div
        className={cn(
          'grid gap-2',
          layout === 'grid2' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
        )}
      >
        {cells.map((cam, i) => (
          <CameraTile
            key={cam?.cameraId || `empty-${i}`}
            camera={cam}
            size="sm"
            onClick={onSelect}
            selected={cam && active?.cameraId === cam.cameraId}
            isActive={cam && active?.cameraId === cam.cameraId}
            onToggleFullscreen={(c) => setFullscreenCameraId((prev) => (prev ? null : c.cameraId))}
            detection={cam ? detectionsByCamera[cam.cameraId] : null}
            onDismissDetection={onDismissDetection}
          />
        ))}
      </div>
    </div>
  );
};

const LayoutSwitcher = ({ value, onChange }) => (
  <div className="flex rounded-md border border-white/10 overflow-hidden">
    {LAYOUTS.map((l) => {
      const Icon = l.icon;
      const selected = value === l.value;
      return (
        <button
          key={l.value}
          type="button"
          onClick={() => onChange(l.value)}
          title={`Layout ${l.label}`}
          className={cn(
            'flex items-center gap-1 px-2.5 h-8 text-[10px] font-label uppercase',
            selected ? 'bg-amber-400/20 text-amber-300' : 'text-on-surface-variant hover:bg-white/5'
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          {l.label}
        </button>
      );
    })}
  </div>
);

export default CameraGrid;
