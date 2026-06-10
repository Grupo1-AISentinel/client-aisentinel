import { useEffect, useRef, useState } from 'react';
import { Input, Select } from '../../../shared/components/ui/index.js';
import { Loader2, Play, X, Film } from 'lucide-react';
import { cameraService } from '../services/cameraService.js';
import { getVideoUrl, IP_PROTOCOLS } from '../camera.constants.js';
import toast from 'react-hot-toast';
import { cn } from '../../../shared/utils/cn.js';

const ACCEPTED_TYPES = [
  'video/mp4',
  'video/webm',
  'video/avi',
  'video/x-matroska',
  'video/quicktime',
  'video/x-msvideo',
];

const CameraSourceFields = ({ source, config, onChange }) => {
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (source !== 'video') return undefined;
    let cancelled = false;
    cameraService
      .listVideoAssets()
      .then((list) => !cancelled && setVideos(list))
      .catch(() => !cancelled && setVideos([]));
    return () => {
      cancelled = true;
    };
  }, [source]);

  const processFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { filename } = await cameraService.uploadVideo(file);
      onChange({ video: { path: filename } });
      if (!videos.includes(filename)) {
        setVideos((prev) => [...prev, filename]);
      }
      toast.success(`Video "${filename}" subido correctamente`);
    } catch (err) {
      toast.error(err.message || 'Error al subir el video');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (source === 'webcam') {
    return (
      <div className="flex flex-col gap-3">
        <Input
          label="ID del dispositivo (opcional)"
          helper="Déjelo vacío para usar la cámara predeterminada. Si tiene varias cámaras, pegue el deviceId de la que quiera usar."
          value={config?.webcam?.deviceId || ''}
          onChange={(e) =>
            onChange({
              webcam: {
                ...(config?.webcam || {}),
                deviceId: e.target.value,
              },
            })
          }
        />
        <Select
          label="Cámara preferida"
          helper="En móviles: 'trasera' para apuntar al entorno, 'frontal' para selfie. Se ignora si ingresó un deviceId."
          options={[
            { value: 'environment', label: 'Trasera' },
            { value: 'user', label: 'Frontal' },
          ]}
          value={config?.webcam?.facingMode || 'environment'}
          onChange={(e) =>
            onChange({
              webcam: {
                ...(config?.webcam || {}),
                facingMode: e.target.value,
              },
            })
          }
        />
      </div>
    );
  }

  if (source === 'video') {
    const currentPath = config?.video?.path || '';
    const previewUrl = getVideoUrl(currentPath);

    const onDrop = (event) => {
      event.preventDefault();
      setDragOver(false);
      const file = event.dataTransfer?.files?.[0];
      if (file) {
        if (!ACCEPTED_TYPES.includes(file.type) && !/\.(mp4|webm|avi|mkv|mov)$/i.test(file.name)) {
          toast.error('Tipo de archivo no permitido. Use mp4, webm, avi o mkv.');
          return;
        }
        processFile(file);
      }
    };

    return (
      <div className="flex flex-col gap-3">
        {previewUrl && (
          <div className="relative rounded-md overflow-hidden bg-black border border-white/10 aspect-video">
            <video
              key={previewUrl}
              src={previewUrl}
              controls
              muted
              playsInline
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={() => onChange({ video: { path: '' } })}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-surface-overlay/80 text-on-surface hover:bg-error/20"
              aria-label="Quitar video"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-5 rounded-md border-2 border-dashed transition-colors text-center',
            dragOver
              ? 'border-amber-400 bg-amber-400/10'
              : 'border-white/15 bg-surface-container-low',
            uploading && 'opacity-60 pointer-events-none'
          )}
        >
          <div className="w-10 h-10 rounded-full bg-amber-400/15 text-amber-300 flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : previewUrl ? (
              <Play className="w-5 h-5" />
            ) : (
              <Film className="w-5 h-5" />
            )}
          </div>
          <div className="text-xs text-on-surface">
            {uploading ? (
              'Subiendo video…'
            ) : (
              <>
                Arrastra aquí un video o{' '}
                <button
                  type="button"
                  className="text-secondary underline hover:text-secondary-fixed"
                  onClick={() => fileInputRef.current?.click()}
                >
                  elige un archivo
                </button>
              </>
            )}
          </div>
          <p className="text-[10px] text-on-surface-dim">mp4, webm, avi, mkv · máximo 200MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={(e) => processFile(e.target.files?.[0])}
            disabled={uploading}
            className="hidden"
          />
        </div>

        {videos.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="font-label text-[10px] text-on-surface-variant ml-1">
              Videos disponibles
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
              {videos.map((v) => {
                const selected = v === currentPath;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onChange({ video: { path: v } })}
                    className={cn(
                      'flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs font-mono text-left',
                      selected
                        ? 'border-secondary bg-amber-400/15 text-amber-300'
                        : 'border-white/10 bg-surface-container-low text-on-surface hover:border-white/30'
                    )}
                  >
                    <Film className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{v}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Input
          label="O escribe el nombre del archivo"
          placeholder="play_3.mp4"
          helper="Si ya tienes el video en la carpeta del tótem, escribe solo el nombre"
          value={currentPath}
          onChange={(e) => onChange({ video: { path: e.target.value } })}
        />
      </div>
    );
  }

  if (source === 'ip') {
    const currentProtocol = config?.ip?.protocol || 'mjpeg';
    return (
      <div className="flex flex-col gap-3">
        <Select
          label="Protocolo"
          helper="MJPEG es el más compatible. HLS requiere hls.js (ya incluido)."
          options={IP_PROTOCOLS}
          value={currentProtocol}
          onChange={(e) =>
            onChange({
              ip: { ...(config?.ip || {}), protocol: e.target.value, url: config?.ip?.url || '' },
            })
          }
        />
        <Input
          label="URL del stream"
          placeholder={
            currentProtocol === 'mjpeg'
              ? 'http://192.168.1.10:8080/video'
              : 'https://example.com/stream.m3u8'
          }
          value={config?.ip?.url || ''}
          onChange={(e) =>
            onChange({
              ip: { ...(config?.ip || {}), protocol: currentProtocol, url: e.target.value },
            })
          }
          helper={
            currentProtocol === 'mjpeg'
              ? 'Stream HTTP multipart/x-mixed-replace. Algunas cámaras IP lo exponen en /video o /mjpg.'
              : 'Manifest HLS (.m3u8). Requiere servidor HLS o cámara con HLS habilitado.'
          }
        />
        {currentProtocol === 'mjpeg' && (
          <p className="font-label text-[10px] text-on-surface-variant">
            Si el stream requiere autenticación, incluya las credenciales en la URL:
            http://usuario:contraseña@host:puerto/ruta
          </p>
        )}
      </div>
    );
  }

  if (source === 'wifi') {
    return (
      <Input
        label="SSID de la red"
        placeholder="campus-wifi"
        value={config?.wifi?.ssid || ''}
        onChange={(e) => onChange({ wifi: { ssid: e.target.value } })}
        disabled
        helper="Funcionalidad disponible próximamente."
      />
    );
  }

  return null;
};

export default CameraSourceFields;
