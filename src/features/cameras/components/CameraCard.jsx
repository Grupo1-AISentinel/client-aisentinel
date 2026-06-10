import { Camera, CameraOff, Video, Globe, Wifi, Pencil, Trash2, Zap, UserX } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/index.js';
import { CAMERA_TYPE_LABELS } from '../camera.constants.js';

const SOURCE_ICON = {
  webcam: Camera,
  video: Video,
  ip: Globe,
  wifi: Wifi,
};

const sourceSummary = (camera) => {
  if (camera.source === 'webcam') {
    const idx = camera.sourceConfig?.webcam?.index ?? 0;
    return `Webcam ${idx}`;
  }
  if (camera.source === 'video') {
    const path = camera.sourceConfig?.video?.path || '—';
    return `Video: ${path}`;
  }
  if (camera.source === 'ip') {
    return camera.sourceConfig?.ip?.url || 'IP no configurada';
  }
  if (camera.source === 'wifi') {
    return camera.sourceConfig?.wifi?.ssid || 'WiFi no configurado';
  }
  return '—';
};

const CameraCard = ({
  camera,
  isAdmin,
  onEdit,
  onRemove,
  onTest,
  onTestUnknown,
  testing = false,
  testingUnknown = false,
}) => {
  const SourceIcon = SOURCE_ICON[camera.source] || Camera;
  const isOnline = camera.status === 'online';

  return (
    <div
      className={`glass-panel rounded-xl p-4 flex flex-col gap-3 border transition-colors ${
        isOnline ? 'border-success/20' : 'border-white/10'
      }`}
    >
      <header className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${
            isOnline
              ? 'bg-success/15 text-success-bright border border-success/20'
              : 'bg-surface-container-high text-on-surface-dim border border-white/5'
          }`}
        >
          {isOnline ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm font-semibold text-on-surface truncate">
            {camera.name || camera.cameraId}
          </h3>
          <p className="text-xs text-on-surface-variant truncate font-mono">{camera.cameraId}</p>
        </div>
        <Badge variant={isOnline ? 'success' : 'default'} size="sm">
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </header>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-on-surface-dim font-label text-[9px] uppercase">Ubicación</p>
          <p className="text-on-surface truncate">{camera.location || '—'}</p>
        </div>
        <div>
          <p className="text-on-surface-dim font-label text-[9px] uppercase">Tipo</p>
          <p className="text-on-surface truncate">{CAMERA_TYPE_LABELS[camera.cameraType] || '—'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-on-surface-dim font-label text-[9px] uppercase">Fuente</p>
          <p className="text-on-surface flex items-center gap-1.5">
            <SourceIcon className="w-3.5 h-3.5 text-secondary" />
            <span className="truncate">{sourceSummary(camera)}</span>
          </p>
        </div>
        <div>
          <p className="text-on-surface-dim font-label text-[9px] uppercase">Detecciones hoy</p>
          <p className="text-on-surface font-mono">{camera.detectionsToday ?? 0}</p>
        </div>
        <div>
          <p className="text-on-surface-dim font-label text-[9px] uppercase">Infracciones</p>
          <p className="text-on-surface font-mono">{camera.infractionsToday ?? 0}</p>
        </div>
      </div>

      {isAdmin && (
        <footer className="flex justify-between items-center pt-2 border-t border-white/5">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onTest?.(camera)}
              disabled={testing || testingUnknown}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-label uppercase tracking-wide text-secondary hover:bg-amber-400/10 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Probar detección"
              title="Simula una detección con estudiante conocido"
            >
              <Zap className="w-3 h-3" />
              {testing ? 'Enviando…' : 'Conocido'}
            </button>
            <button
              type="button"
              onClick={() => onTestUnknown?.(camera)}
              disabled={testing || testingUnknown}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-label uppercase tracking-wide text-warning-bright hover:bg-warning/10 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Probar detección desconocida"
              title="Simula una detección de persona sin registrar"
            >
              <UserX className="w-3 h-3" />
              {testingUnknown ? 'Enviando…' : 'Desconocido'}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(camera)}
              className="p-1.5 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-white/5"
              aria-label="Editar"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onRemove?.(camera)}
              className="p-1.5 rounded-md text-error hover:bg-error/10"
              aria-label="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default CameraCard;
