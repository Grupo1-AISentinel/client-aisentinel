import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Camera,
  CameraOff,
  VideoOff,
  List,
  BarChart,
  FileText,
  ArrowRight,
  AlertCircle,
  Scan,
  Brain,
  BrainCircuit,
  WifiOff,
} from 'lucide-react';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import { Card, CardHeader, Badge, Button, Skeleton } from '../../../shared/components/ui/index.js';
import EmptyState from '../../../shared/components/feedback/EmptyState.jsx';
import ErrorState from '../../../shared/components/feedback/ErrorState.jsx';
import { cameraService } from '../services/cameraService.js';
import { socketService } from '../../../shared/socket/socketClient.js';
import { SOCKET_EVENTS, ROLES, GRADES } from '../../../shared/utils/constants.js';
import { formatTime } from '../../../shared/utils/formatters.js';
import { isNotFoundError } from '../../../shared/api/errors.js';
import { extractErrorMessage } from '../../../shared/api/errors.js';
import { inspectionService } from '../../inspections/services/inspectionService.js';
import { cn } from '../../../shared/utils/cn.js';
import { useAuthStore } from '../../auth/stores/authStore.js';
import { useDetectionStore } from '../stores/detectionStore.js';
import CameraGrid from '../components/CameraGrid.jsx';
import toast from 'react-hot-toast';

const PyimageStatusChip = ({ connected }) => {
  if (connected) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-success/10 text-success-bright border border-success/20 font-label text-[10px]"
        title="El motor de IA (YOLO + ResNet18) está respondiendo"
      >
        <BrainCircuit className="w-3 h-3" />
        IA Conectada
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-error/10 text-error border border-error/30 font-label text-[10px] animate-pulse"
      title="El motor de IA no responde. Los frames se suben pero no se procesan."
    >
      <Brain className="w-3 h-3" />
      IA Offline
    </span>
  );
};

const CumplimientoDonut = ({ percentage, loading }) => {
  const value = Math.max(0, Math.min(100, Math.round(percentage || 0)));
  return (
    <div className="flex flex-col items-center justify-center relative p-4">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke="var(--color-surface-container)"
            strokeWidth="3.5"
          />
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke="var(--color-success-bright)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${value}, 100`}
            style={{
              filter: 'drop-shadow(0 0 6px rgba(74,222,128,0.4))',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {loading ? (
            <span className="text-on-surface-dim">—</span>
          ) : (
            <>
              <span className="font-display text-2xl font-bold text-on-surface leading-none">
                {value}%
              </span>
              <span className="font-label text-[9px] text-on-surface-variant mt-1">
                Cumplimiento
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ProgressBar = ({ label, value, total, color = 'success' }) => {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const colorMap = {
    success: {
      bar: 'bg-success-bright',
      shadow: 'shadow-[0_0_8px_rgba(74,222,128,0.6)]',
      text: 'text-success-bright',
    },
    warning: {
      bar: 'bg-secondary',
      shadow: 'shadow-[0_0_8px_rgba(235,194,70,0.6)]',
      text: 'text-secondary',
    },
  };
  const tone = colorMap[color] || colorMap.success;
  return (
    <div>
      <div className="flex justify-between font-label text-[10px] mb-1">
        <span className="text-on-surface">{label}</span>
        <span className={`${tone.text} font-mono`}>
          {value} / {total}
        </span>
      </div>
      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', tone.bar, tone.shadow)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const MonitoringPage = () => {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === ROLES.ADMIN;
  const coordinatorGrade = useAuthStore((s) => s.coordinatorGrade);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisActive, setAnalysisActive] = useState(true);
  const [activeCameraId, setActiveCameraId] = useState(null);
  const [layout, setLayout] = useState('single');
  const [inspectionState, setInspectionState] = useState({});
  const [togglingInspection, setTogglingInspection] = useState(false);

  const detectionsByCamera = useDetectionStore((s) => s.detectionsByCamera);
  const alertsFeed = useDetectionStore((s) => s.feed);
  const removeDetection = useDetectionStore((s) => s.removeDetection);
  const pyimageConnected = useDetectionStore((s) => s.pyimageConnected);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cameraService.getActive();
      const list = Array.isArray(data) ? data : data.cameras || data.data || [];
      setCameras(list);
    } catch (err) {
      if (isNotFoundError(err)) {
        setCameras([]);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInspections = useCallback(async () => {
    try {
      const list = await inspectionService.list();
      const map = {};
      list.forEach((item) => {
        map[item.grade] = Boolean(item.isActive);
      });
      GRADES.forEach((g) => {
        if (map[g] === undefined) map[g] = false;
      });
      setInspectionState(map);
    } catch (err) {
      console.warn('No se pudo cargar estado de inspecciones:', err.message);
    }
  }, []);

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      fetch();
      fetchInspections();
    }, 0);
    // connect() es idempotente: devuelve el socket actual o lo crea.
    const sock = socketService.connect();
    if (!sock) return undefined;

    const handleStatus = (payload) => {
      setCameras((prev) => {
        const index = prev.findIndex((c) => c.cameraId === payload.cameraId);
        if (index === -1) return [...prev, payload];
        const next = [...prev];
        next[index] = { ...next[index], ...payload };
        return next;
      });
    };

    socketService.on(SOCKET_EVENTS.CAMERA_STATUS, handleStatus);

    return () => {
      window.clearTimeout(initialLoadTimer);
      socketService.off(SOCKET_EVENTS.CAMERA_STATUS, handleStatus);
    };
  }, [fetch, fetchInspections]);

  const inspectionsEnabled = useMemo(
    () => Object.values(inspectionState).some(Boolean),
    [inspectionState]
  );
  const anyInspectionLoading = togglingInspection;

  const handleToggleInspection = async () => {
    setTogglingInspection(true);
    const willEnable = !inspectionsEnabled;
    const allowedGrades =
      isAdmin || !coordinatorGrade ? GRADES : GRADES.filter((g) => g === coordinatorGrade);
    const targetGrades = allowedGrades.filter((g) => inspectionState[g] !== willEnable);
    const previous = { ...inspectionState };
    setInspectionState((s) => {
      const next = { ...s };
      targetGrades.forEach((g) => {
        next[g] = willEnable;
      });
      return next;
    });
    try {
      await Promise.all(targetGrades.map((g) => inspectionService.toggle(g)));
      toast.success(
        willEnable ? 'Inspección de uniformes activada' : 'Inspección de uniformes desactivada'
      );
    } catch (err) {
      setInspectionState(previous);
      toast.error(extractErrorMessage(err));
    } finally {
      setTogglingInspection(false);
    }
  };

  const onlineCount = cameras.filter((c) => c.status === 'online').length;
  const primaryCamera =
    cameras.find((c) => c.cameraId === activeCameraId) ||
    cameras.find((c) => c.status === 'online') ||
    cameras[0];

  const stats = useMemo(() => {
    const total = cameras.reduce(
      (acc, c) => ({
        detections: acc.detections + (c.detectionsToday || 0),
        infractions: acc.infractions + (c.infractionsToday || 0),
      }),
      { detections: 0, infractions: 0 }
    );
    const correct = Math.max(0, total.detections - total.infractions);
    const totalAlertsFeed = alertsFeed.length;
    return {
      ...total,
      correct,
      porcentajeCumplimiento: total.detections > 0 ? (correct / total.detections) * 100 : 0,
      criticalAlerts: alertsFeed.filter((a) => a.reason === 'ACCESORIO_NO_PERMITIDO').length,
      totalAlertsFeed,
    };
  }, [cameras, alertsFeed]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Monitoreo"
        subtitle={
          <span className="inline-flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            {primaryCamera
              ? `Cámara activa: ${primaryCamera.cameraId || primaryCamera.id} · ${primaryCamera.location || 'Sin ubicación'}`
              : 'Sin cámaras registradas'}
            <PyimageStatusChip connected={pyimageConnected} />
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              leftIcon={<VideoOff className="w-4 h-4" />}
              onClick={() => setAnalysisActive((v) => !v)}
            >
              {analysisActive ? 'Pausar análisis' : 'Reanudar análisis'}
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Scan className="w-4 h-4" />}
              onClick={handleToggleInspection}
              loading={anyInspectionLoading}
              title={
                inspectionsEnabled
                  ? 'La inspección de uniformes está activa'
                  : 'La inspección de uniformes está desactivada'
              }
            >
              {inspectionsEnabled ? 'Detener inspección' : 'Iniciar inspección'}
            </Button>
          </div>
        }
      />

      {!pyimageConnected && cameras.length > 0 && (
        <Card glass className="border-warning/30 bg-warning/5 p-4">
          <div className="flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-warning-bright shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm text-on-surface mb-1">
                Servicio de IA no disponible
              </p>
              <p className="font-label text-[11px] text-on-surface-variant">
                El motor de detección (YOLO + ResNet18 + ChromaDB) no responde. Los frames se siguen
                subiendo al admin, pero no se procesan. Verifica que el contenedor pyimage esté
                activo (
                <code className="px-1 rounded bg-surface-container font-mono text-[10px]">
                  docker compose ps
                </code>{' '}
                en
                <code className="px-1 rounded bg-surface-container font-mono text-[10px]">
                  server-pyimage-aisentinel
                </code>
                ).
              </p>
            </div>
          </div>
        </Card>
      )}

      {error ? (
        <ErrorState description={error} onRetry={fetch} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 flex flex-col gap-5 min-h-0">
            <CameraGrid
              cameras={cameras}
              activeId={activeCameraId}
              onSelect={(cam) => setActiveCameraId(cam.cameraId)}
              layout={layout}
              onLayoutChange={setLayout}
              detectionsByCamera={detectionsByCamera}
              onDismissDetection={removeDetection}
            />

            {/* Eventos recientes - DESACTIVADO
            <Card glass className="p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-outline-soft flex justify-between items-center bg-surface-container/50">
                <h3 className="font-display text-base text-on-surface flex items-center gap-2">
                  <List className="w-4 h-4 text-secondary" />
                  Eventos recientes
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/alerts')}
                  className="text-secondary hover:text-secondary-fixed font-semibold text-xs flex items-center gap-1"
                >
                  Ver Todo <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-surface-container z-10">
                    <tr className="text-on-surface-variant font-label text-[10px] border-b border-outline-soft">
                      <th className="text-left p-2">Hora</th>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Evento</th>
                      <th className="text-left p-2">Cámara</th>
                      <th className="text-right p-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alertsFeed.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-on-surface-dim text-sm">
                          Sin eventos
                        </td>
                      </tr>
                    ) : (
                      alertsFeed.map((entry, i) => {
                        const reasonLabel =
                          entry.reason === 'UNIFORME_INCOMPLETO'
                            ? 'Suéter No Oficial'
                            : entry.reason === 'ACCESORIO_NO_PERMITIDO'
                              ? 'Accesorio No Permitido'
                              : entry.reason === 'PERSONA_DESCONOCIDA'
                                ? 'Persona Desconocida'
                                : 'Detección IA';
                        const isUnknown = entry.isUnknown || !entry.studentCard;
                        return (
                          <tr
                            key={`${entry.studentCard || 'unknown'}-${entry.lastDetection || entry.createdAt || i}`}
                            className="border-b border-outline-variant hover:bg-surface-container-high group"
                          >
                            <td className="p-2 text-on-surface-variant font-mono text-xs">
                              {entry.lastDetection || entry.createdAt
                                ? new Date(
                                    entry.lastDetection || entry.createdAt
                                  ).toLocaleTimeString('es-GT', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                  })
                                : formatTime(new Date())}
                            </td>
                            <td className="p-2 font-mono text-xs text-on-surface">
                              {isUnknown ? (
                                <span className="text-warning-bright">Desconocido</span>
                              ) : (
                                entry.studentCard
                              )}
                            </td>
                            <td className="p-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400/10 text-secondary border border-amber-400/25 font-label text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                                {reasonLabel}
                              </span>
                            </td>
                            <td className="p-2 text-on-surface-variant text-xs">
                              {entry.cameraId || primaryCamera?.cameraId || '—'}
                            </td>
                            <td className="p-2 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!entry.studentCard) {
                                    navigate('/alerts');
                                    return;
                                  }
                                  navigate(`/alerts/${encodeURIComponent(entry.studentCard)}`);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-secondary p-1 rounded hover:bg-surface-container-high"
                                aria-label="Ver detalle"
                                title="Ver detalle"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
            */}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Cumplimiento - DESACTIVADO
            <Card glass>
              <h3 className="font-display text-base text-on-surface mb-4 border-b border-outline-soft pb-3 flex items-center gap-2">
                <BarChart className="w-4 h-4 text-secondary" />
                Cumplimiento
              </h3>
              <CumplimientoDonut percentage={stats.porcentajeCumplimiento} loading={loading} />
              <div className="space-y-3 mt-2">
                <ProgressBar
                  label="Uniformes Correctos"
                  value={stats.correct}
                  total={Math.max(stats.detections, 1)}
                  color="success"
                />
                <ProgressBar
                  label="Infracciones"
                  value={stats.infractions}
                  total={Math.max(stats.detections, 1)}
                  color="warning"
                />
              </div>
              <div className="pt-4 mt-4 border-t border-outline-soft">
                <span className="block font-label text-[10px] text-on-surface-variant mb-2 uppercase tracking-wider">
                  Resumen de cámaras
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-surface-container border border-outline-soft rounded-md p-2">
                    <p className="font-display text-lg font-bold text-success-bright">
                      {onlineCount}
                    </p>
                    <p className="font-label text-[9px] text-on-surface-variant">En línea</p>
                  </div>
                  <div className="bg-surface-container border border-outline-soft rounded-md p-2">
                    <p className="font-display text-lg font-bold text-secondary">
                      {formatTime(new Date()).slice(0, 5)}
                    </p>
                    <p className="font-label text-[9px] text-on-surface-variant">Turno</p>
                  </div>
                  <div className="bg-surface-container border border-outline-soft rounded-md p-2">
                    <p className="font-display text-lg font-bold text-on-surface">
                      {stats.totalAlertsFeed}
                    </p>
                    <p className="font-label text-[9px] text-on-surface-variant">Eventos</p>
                  </div>
                </div>
              </div>
              <Button
                variant="primary"
                fullWidth
                leftIcon={<FileText className="w-4 h-4" />}
                className="mt-4"
                onClick={() => navigate(isAdmin ? '/statistics' : '/monitoring')}
                disabled={!isAdmin}
                title={
                  isAdmin
                    ? 'Ir a estadísticas para exportar'
                    : 'Solo el rol Administrador puede exportar'
                }
              >
                Exportar turno
              </Button>
            </Card>
            */}

            <Card glass>
              <CardHeader title="Cámaras" description="Conexión activa" />
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : cameras.length === 0 ? (
                <EmptyState
                  icon={CameraOff}
                  title="Sin cámaras"
                  description="Sin cámaras registradas."
                  compact
                />
              ) : (
                <ul className="space-y-1">
                  {cameras.slice(0, 5).map((camera) => {
                    const isOnline = camera.status === 'online';
                    return (
                      <li
                        key={camera.cameraId || camera.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5"
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0',
                            isOnline
                              ? 'bg-success/15 text-success-bright border border-success/20'
                              : 'bg-surface-container-high text-on-surface-dim border border-white/5'
                          )}
                        >
                          {isOnline ? (
                            <Camera className="w-4 h-4" />
                          ) : (
                            <CameraOff className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-on-surface truncate">
                            {camera.cameraId || camera.id}
                          </p>
                          <p className="font-label text-[9px] text-on-surface-variant truncate">
                            {camera.location || 'Sin ubicación'} · {camera.detectionsToday ?? 0}{' '}
                            detecciones
                          </p>
                        </div>
                        <Badge variant={isOnline ? 'success' : 'default'} size="sm">
                          {isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Button
                variant="ghost"
                fullWidth
                size="sm"
                className="mt-3"
                leftIcon={<AlertCircle className="w-4 h-4" />}
                onClick={() => navigate(isAdmin ? '/cameras' : '/monitoring')}
                disabled={!isAdmin}
                title={
                  isAdmin
                    ? 'Ver y gestionar cámaras'
                    : 'Solo el rol Administrador puede gestionar cámaras'
                }
              >
                {isAdmin ? 'Administrar' : 'Solo administrador'}
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringPage;
