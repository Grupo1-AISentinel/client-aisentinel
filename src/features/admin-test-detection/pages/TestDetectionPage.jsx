import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Inbox,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
  FlaskConical,
  Shirt,
  Scan,
  Check,
  AlertTriangle,
  UserX,
  Clock,
  WifiOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, CardHeader, Badge } from '../../../shared/components/ui/index.js';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import { testApi } from '../../../shared/api/adminApi.js';
import { cn } from '../../../shared/utils/cn.js';
import {
  MAX_TEST_IMAGES,
  ACCEPTED_IMAGE_TYPES,
  STATUS_BADGE,
  classifyDetection,
} from '../test.constants.js';

const COMPLY_STROKE = 'var(--color-state-success)';
const INFRACTION_STROKE = 'var(--color-state-error)';
const UNKNOWN_STROKE = 'var(--color-state-warning)';

const studentStroke = (s) => {
  if (s.isUnknown) return UNKNOWN_STROKE;
  if (s.hasAccessory || s.hasUniform === false) return INFRACTION_STROKE;
  return COMPLY_STROKE;
};

const studentLabel = (s) => {
  if (s.isUnknown) return 'Desconocido';
  return s.studentCard || s.studentName || 'Detectado';
};

// Resuelve las dimensiones naturales del archivo de imagen y devuelve
// Resuelve las dimensiones naturales del archivo de imagen y devuelve
// un object URL estable. PATRON DEFINITIVO: NO usamos setSize (que causa
// re-renders y bucles). En su lugar, el <img> nativo del browser mide
// sus dimensiones via onLoad y se guarda en un ref (no en state).
// El SVG overlay lee del ref directamente.
const useImageMeta = (file) => {
  const fileKey = file ? `${file.name}|${file.size}|${file.lastModified || 0}` : null;

  // URL estable: solo cambia si el fileKey cambia
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [fileKey]);

  // Cleanup del URL en unmount
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return { url, fileKey };
};

// Componente separado para el SVG overlay. Recibe solo props primitivas
// (no objetos) para que React.memo shallow-comparison evite re-renders.
// Tambien estable: si el padre re-renderiza, este componente no se vuelve
// a renderizar a menos que cambien las detections o el size.
const BboxOverlay = React.memo(
  ({ detections, imageSize, mode, localLabel }) => {
    if (!imageSize || !imageSize.width || !imageSize.height) return null;
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {detections.map((d, idx) => {
          const stroke = studentStroke(d);
          const face = d.faceBox
            ? {
                x: d.faceBox.left * imageSize.width,
                y: d.faceBox.top * imageSize.height,
                w: (d.faceBox.right - d.faceBox.left) * imageSize.width,
                h: (d.faceBox.bottom - d.faceBox.top) * imageSize.height,
              }
            : null;
          const label = localLabel(d, idx);
          return (
            <g key={`det-${idx}`}>
              {face && (
                <>
                  <rect
                    x={face.x}
                    y={face.y}
                    width={face.w}
                    height={face.h}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={Math.max(2, imageSize.width / 320)}
                    rx={6}
                    style={{ filter: `drop-shadow(0 0 6px ${stroke})` }}
                  />
                  <rect
                    x={face.x}
                    y={Math.max(0, face.y - imageSize.height * 0.04)}
                    width={Math.max(80, label.length * imageSize.width * 0.013 + 24)}
                    height={imageSize.height * 0.035}
                    fill="var(--color-surface-overlay)"
                    opacity="0.9"
                    rx={4}
                  />
                  <text
                    x={face.x + imageSize.width * 0.006}
                    y={Math.max(imageSize.height * 0.028, face.y - imageSize.height * 0.012)}
                    fill={stroke}
                    fontSize={imageSize.width * 0.022}
                    fontFamily="monospace"
                    fontWeight="bold"
                    style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.85))' }}
                  >
                    {label}
                  </text>
                </>
              )}
              {d.clothingBoxes &&
                d.clothingBoxes.map((cb, i) => {
                  if (!cb.box) return null;
                  const x = cb.box.x1 * imageSize.width;
                  const y = cb.box.y1 * imageSize.height;
                  const w = (cb.box.x2 - cb.box.x1) * imageSize.width;
                  const h = (cb.box.y2 - cb.box.y1) * imageSize.height;
                  const cbStroke = cb.valid ? COMPLY_STROKE : INFRACTION_STROKE;
                  return (
                    <g key={`cl-${idx}-${i}`}>
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        fill="none"
                        stroke={cbStroke}
                        strokeWidth={Math.max(1.5, imageSize.width / 480)}
                        strokeDasharray={`${imageSize.width * 0.012} ${imageSize.width * 0.006}`}
                        rx={3}
                        opacity="0.9"
                      />
                      <text
                        x={x}
                        y={y + h + imageSize.height * 0.022}
                        fill={cbStroke}
                        fontSize={imageSize.width * 0.016}
                        fontFamily="monospace"
                        fontWeight="bold"
                        style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.85))' }}
                      >
                        {(cb.class || '').toUpperCase()}
                      </text>
                    </g>
                  );
                })}
            </g>
          );
        })}
      </svg>
    );
  },
  // Custom comparison: solo re-renderizar si cambian las detections o el size
  (prev, next) => {
    if (prev.imageSize !== next.imageSize) return false; // re-render
    if (prev.mode !== next.mode) return false;
    if (prev.localLabel !== next.localLabel) return false;
    if (prev.detections.length !== next.detections.length) return false;
    // Compara detections por referencia (asumiendo que el padre las
    // memoiza, lo cual StableImageResultCard hace)
    if (prev.detections !== next.detections) return false;
    return true; // no re-render
  }
);

const ImageResultCard = ({ result, imageFile, index, mode }) => {
  const { url } = useImageMeta(imageFile);
  // FIX BUCLE DEFINITIVO: el size se guarda en un useRef (NO useState).
  // Asi el componente NO re-renderiza cuando la imagen carga. El BboxOverlay
  // lee del ref directamente via la prop imageSize.
  const sizeRef = useRef({ width: 0, height: 0, loaded: false });
  // useState minimalista que SOLO cambia una vez (false -> true) cuando
  // la imagen carga. Esto fuerza UN re-render para que el BboxOverlay
  // aparezca. No causa bucle porque onLoad se dispara una sola vez por
  // imagen.
  const [imgReady, setImgReady] = React.useState(false);
  const handleImgLoad = (e) => {
    const img = e.target;
    sizeRef.current = {
      width: img.naturalWidth,
      height: img.naturalHeight,
      loaded: true,
    };
    setImgReady(true);
  };
  const handleImgError = () => {
    sizeRef.current = { width: 0, height: 0, loaded: false, error: true };
  };

  // FIX: en modo "Solo ropa" el classificationStatus es siempre el de la
  // ropa (cumple/no cumple), nunca "unknown" (porque el backend retorna
  // isUnknown: true pero el admin ya filtra eso en modo clothing).
  const status = classifyDetection(result.detections, mode);
  const badge = STATUS_BADGE[status];
  // FIX: en modo "Solo ropa" no mostramos "DESCONOCIDO" como label.
  // En su lugar, mostramos un texto neutro "Persona N" ya que el modo
  // clothing no evalua identidad.
  const localLabel = (d, idx) => {
    if (mode === 'clothing') return `Persona ${idx + 1}`;
    return studentLabel(d);
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-surface-container/40">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[10px] text-on-surface-dim">#{index + 1}</span>
          <p className="text-sm font-semibold text-on-surface truncate">{result.imageName}</p>
        </div>
        <Badge variant={badge.variant} size="sm">
          {status === 'cumple' && <Check className="w-3 h-3 mr-1" />}
          {status === 'infraction' && <AlertTriangle className="w-3 h-3 mr-1" />}
          {status === 'unknown' && <UserX className="w-3 h-3 mr-1" />}
          {badge.label}
        </Badge>
      </div>

      <div className="relative bg-black/40 min-h-[120px]">
        {url ? (
          <div className="relative">
            <img
              src={url}
              alt={result.imageName}
              className="w-full max-h-[420px] object-contain bg-black"
              onLoad={handleImgLoad}
              onError={(e) => {
                handleImgError();
                console.error(`[test-image] No se pudo cargar: ${result.imageName}`);
              }}
            />
            {imgReady &&
              sizeRef.current.loaded &&
              sizeRef.current.width > 0 &&
              sizeRef.current.height > 0 &&
              result.detections.length > 0 && (
                <BboxOverlay
                  detections={result.detections}
                  imageSize={sizeRef.current}
                  mode={mode}
                  localLabel={localLabel}
                />
              )}
          </div>
        ) : (
          <div className="aspect-video grid place-items-center text-on-surface-dim">
            <ImageIcon className="w-8 h-8 opacity-50" />
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        {result.detections.length === 0 ? (
          <p className="text-xs text-on-surface-dim text-center py-2">Sin detección de personas</p>
        ) : (
          result.detections.map((d, idx) => (
            <div
              key={idx}
              className="rounded-md border border-white/10 p-2.5 space-y-1.5 bg-surface-container-low/50"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-mono text-on-surface truncate">
                  {mode === 'clothing'
                    ? `Persona ${idx + 1}`
                    : d.isUnknown
                      ? 'Desconocido'
                      : d.studentCard || '—'}
                </p>
                <div className="flex items-center gap-1.5">
                  {d.hasUniform === true && (
                    <Badge variant="success" size="sm">
                      <Check className="w-3 h-3 mr-0.5" />
                      Uniforme OK
                    </Badge>
                  )}
                  {d.hasUniform === false && (
                    <Badge variant="error" size="sm">
                      Uniforme NO
                    </Badge>
                  )}
                  {d.hasAccessory && (
                    <Badge variant="warning" size="sm">
                      Accesorio
                    </Badge>
                  )}
                </div>
              </div>
              {d.clothingBoxes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {d.clothingBoxes.map((cb, i) => (
                    <span
                      key={i}
                      className={cn(
                        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-label',
                        cb.valid
                          ? 'bg-success/20 text-success-bright'
                          : 'bg-error/20 text-error-bright'
                      )}
                    >
                      {cb.valid ? <Shirt className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                      {cb.class}
                    </span>
                  ))}
                </div>
              )}
              {typeof d.confidence === 'number' && (
                <p className="text-[10px] text-on-surface-dim font-mono">
                  Confianza: {(d.confidence * 100).toFixed(1)}%
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

const LoadingOverlay = ({ onCancel, elapsedSec }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-surface-container border border-white/10 min-w-[320px] max-w-md">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-secondary/20 border-t-secondary animate-spin" />
        <Scan className="w-5 h-5 text-secondary absolute inset-0 m-auto animate-pulse" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="font-display text-sm text-on-surface">Procesando imagenes</p>
        <p className="font-label text-[10px] text-on-surface-dim flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          {elapsedSec}s transcurridos
        </p>
        <p className="font-label text-[9px] text-on-surface-dim mt-1 max-w-xs">
          El modelo de IA puede tardar en responder, especialmente la primera vez.
        </p>
      </div>
      <div className="w-full h-1 rounded-full bg-surface-container-high overflow-hidden">
        <div
          className="h-full bg-secondary rounded-full"
          style={{
            width: '40%',
            animation: 'scan-horizontal 1.4s ease-in-out infinite',
          }}
        />
      </div>
      {onCancel && (
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
      )}
    </div>
  </div>
);

const ErrorBanner = ({ message, onRetry, onDismiss }) => (
  <Card className="border-error/30 bg-error/5">
    <div className="flex items-start gap-3 p-4">
      <WifiOff className="w-5 h-5 text-error-bright shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm text-on-surface mb-1">No se pudo procesar</p>
        <p className="font-label text-[11px] text-on-surface-variant">{message}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <Button variant="primary" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  </Card>
);

// ImageResultCard internamente NO re-renderiza al cargar la imagen (usa
// useRef para el size). El BboxOverlay está memoizado con comparación
// custom. Asi que NO necesitamos un wrapper StableImageResultCard.
// React.memo del BboxOverlay + useRef del size rompen el bucle.

const TestDetectionPage = () => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [mode, setMode] = useState('clothing');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const previewUrlsRef = useRef([]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current = [];
      if (timerRef.current) clearInterval(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const startTimer = () => {
    setElapsedSec(0);
    const started = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - started) / 1000));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const addFiles = (incoming) => {
    const accepted = Array.from(incoming).filter(
      (f) => ACCEPTED_IMAGE_TYPES.includes(f.type) && f.size <= 10 * 1024 * 1024
    );
    if (accepted.length === 0) {
      toast.error('Solo se aceptan JPEG/PNG/WebP hasta 10MB');
      return;
    }
    setFiles((prev) => {
      const combined = [...prev, ...accepted];
      const trimmed = combined.slice(0, MAX_TEST_IMAGES);
      if (combined.length > MAX_TEST_IMAGES) {
        toast.error(`Máximo ${MAX_TEST_IMAGES} imágenes`);
      }
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      const urls = trimmed.map((f) => URL.createObjectURL(f));
      previewUrlsRef.current = urls;
      setPreviews(urls.map((url, i) => ({ name: trimmed[i].name, url })));
      return trimmed;
    });
  };

  const removeFile = (idx) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      const urls = next.map((f) => URL.createObjectURL(f));
      previewUrlsRef.current = urls;
      setPreviews(urls.map((url, i) => ({ name: next[i].name, url })));
      return next;
    });
  };

  const runDetection = async () => {
    if (files.length === 0) {
      toast.error('Agrega al menos una imagen');
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setResults(null);
    setErrorMsg(null);
    startTimer();
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      const response = await testApi.detect(formData, mode, { signal: controller.signal });
      setResults(response.results || []);
    } catch (err) {
      const isTimeout = err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message || '');
      const isCanceled = err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError';
      if (isCanceled) {
        return;
      }
      if (isTimeout) {
        setErrorMsg(
          'El servicio de IA tardó demasiado en responder (>60s). Verifica que el contenedor pyimage este corriendo (docker compose ps) o reintenta con menos imagenes.'
        );
      } else if (err?.response?.status === 502 || err?.response?.status === 503) {
        setErrorMsg(
          'El servicio de IA no esta disponible. Verifica que el contenedor pyimage este activo e intenta de nuevo.'
        );
      } else {
        setErrorMsg(err?.message || 'Error al procesar las imagenes');
      }
      toast.error(err?.message || 'Error al procesar las imágenes');
    } finally {
      setLoading(false);
      stopTimer();
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortRef.current) abortRef.current.abort();
    setLoading(false);
    stopTimer();
    toast('Procesamiento cancelado', { icon: '⏹️' });
  };

  const summary = useMemo(() => {
    if (!results) return null;
    const counts = { cumple: 0, infraction: 0, unknown: 0, empty: 0 };
    results.forEach((r) => {
      // FIX: en modo clothing, classifyDetection ignora isUnknown y
      // solo evalua la ropa. Asi no infla el contador de Desconocidos
      // ni contradice el badge de la imagen.
      const status = classifyDetection(r.detections, mode);
      counts[status] += 1;
    });
    return counts;
  }, [results, mode]);

  return (
    <div className="flex flex-col gap-6">
      {loading && <LoadingOverlay onCancel={handleCancel} elapsedSec={elapsedSec} />}

      <PageHeader
        title="Test de detección"
        subtitle="Sube imágenes para validar el pipeline de verificación de uniformes."
      />

      {errorMsg && (
        <ErrorBanner
          message={errorMsg}
          onRetry={() => {
            setErrorMsg(null);
            runDetection();
          }}
          onDismiss={() => setErrorMsg(null)}
        />
      )}

      <Card glass>
        <CardHeader
          title="Configuración"
          description="Selecciona el modo de pipeline y sube las imágenes."
          action={<FlaskConical className="w-4 h-4 text-secondary" />}
        />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <label
              className={cn(
                'flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors flex-1',
                mode === 'clothing'
                  ? 'border-amber-400 bg-amber-400/10'
                  : 'border-white/10 hover:border-white/20'
              )}
            >
              <input
                type="radio"
                name="mode"
                value="clothing"
                checked={mode === 'clothing'}
                onChange={(e) => setMode(e.target.value)}
                className="accent-secondary"
              />
              <div className="flex-1">
                <p className="text-sm text-on-surface font-medium">Solo ropa</p>
                <p className="text-[11px] text-on-surface-variant">
                  Detección de uniforme (YOLO + clothing engine)
                </p>
              </div>
            </label>
            <label
              className={cn(
                'flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors flex-1',
                mode === 'full'
                  ? 'border-amber-400 bg-amber-400/10'
                  : 'border-white/10 hover:border-white/20'
              )}
            >
              <input
                type="radio"
                name="mode"
                value="full"
                checked={mode === 'full'}
                onChange={(e) => setMode(e.target.value)}
                className="accent-secondary"
              />
              <div className="flex-1">
                <p className="text-sm text-on-surface font-medium">Identidad + uniforme</p>
                <p className="text-[11px] text-on-surface-variant">
                  Detección de cara + uniforme (requiere estudiantes registrados)
                </p>
              </div>
            </label>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            className={cn(
              'border-2 border-dashed rounded-md p-6 text-center transition-colors',
              dragOver ? 'border-secondary bg-secondary/5' : 'border-white/15'
            )}
          >
            <input
              type="file"
              id="test-files"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              multiple
              onChange={(e) => addFiles(e.target.files)}
              className="hidden"
            />
            <label htmlFor="test-files" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-on-surface-variant" />
              <p className="text-sm text-on-surface">
                Arrastra imágenes aquí o haz clic para seleccionar
              </p>
              <p className="text-[11px] text-on-surface-dim">
                JPEG, PNG o WebP · máximo {MAX_TEST_IMAGES} imágenes · 10MB cada una
              </p>
            </label>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {previews.map((p, i) => (
                <div key={p.url} className="relative group">
                  <img
                    src={p.url}
                    alt={p.name}
                    className="w-full aspect-square object-cover rounded border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-surface-overlay/90 text-on-surface hover:bg-error/80 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Quitar ${p.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="primary"
            onClick={runDetection}
            loading={loading}
            disabled={files.length === 0}
            leftIcon={
              loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FlaskConical className="w-4 h-4" />
              )
            }
          >
            {loading ? 'Procesando…' : `Probar con ${files.length} imagen(es)`}
          </Button>
        </div>
      </Card>

      {results && results.length > 0 && summary && (
        <Card glass>
          <CardHeader
            title="Resultados"
            description={`${results.length} imagen(es) procesada(s)`}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <SummaryStat label="Cumplen" value={summary.cumple} color="success" />
            <SummaryStat label="No cumplen" value={summary.infraction} color="error" />
            {mode !== 'clothing' && (
              <SummaryStat label="Desconocidos" value={summary.unknown} color="warning" />
            )}
            <SummaryStat label="Sin deteccion" value={summary.empty} color="default" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((r) => (
              <ImageResultCard
                key={r.imageIndex}
                result={r}
                imageFile={files[r.imageIndex]}
                index={r.imageIndex}
                mode={mode}
              />
            ))}
          </div>
        </Card>
      )}

      {results && results.length === 0 && (
        <Card glass>
          <div className="p-8 text-center text-on-surface-variant">
            <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Sin resultados</p>
          </div>
        </Card>
      )}

      {!results && !errorMsg && files.length === 0 && (
        <Card glass>
          <div className="p-8 text-center text-on-surface-variant">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Sube imágenes para ver los resultados</p>
            <p className="text-[11px] text-on-surface-dim mt-1">
              Soporta vista múltiple de la misma persona (frente, espalda, lateral)
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

const SummaryStat = ({ label, value, color }) => {
  const colors = {
    success: 'text-success-bright bg-success/10 border-success/20',
    error: 'text-error-bright bg-error/10 border-error/20',
    warning: 'text-warning-bright bg-warning/10 border-warning/20',
    default: 'text-on-surface-variant bg-surface-container border-white/10',
  };
  return (
    <div className={cn('rounded-md border p-2 text-center', colors[color])}>
      <p className="font-display text-lg font-bold leading-none">{value}</p>
      <p className="font-label text-[9px] uppercase mt-1 opacity-80">{label}</p>
    </div>
  );
};

export default TestDetectionPage;
