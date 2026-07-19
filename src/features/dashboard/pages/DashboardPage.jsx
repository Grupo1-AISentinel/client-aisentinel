import { useEffect, useState, useMemo } from 'react';
import { Hammer, Shirt, CheckSquare, AlertTriangle, Download, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import {
  Button,
  MetricCard,
  Skeleton,
  Card,
  CardHeader,
} from '../../../shared/components/ui/index.js';
import ExportReportModal from '../../../shared/components/ui/ExportReportModal.jsx';
import { statisticsApi, camerasApi, alertsApi } from '../../../shared/api/adminApi.js';
import { isNotFoundError } from '../../../shared/api/errors.js';
import { useAuthStore } from '../../auth/stores/authStore.js';
import { ROLE_LABELS } from '../../../shared/utils/constants.js';
import { formatNumber, formatRelativeTime } from '../../../shared/utils/formatters.js';
import EmptyState from '../../../shared/components/feedback/EmptyState.jsx';

const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const WeeklyChart = ({ data, loading }) => {
  if (loading) {
    return <Skeleton className="h-[280px] w-full" />;
  }
  const values = (data || []).map((d) => Number(d.value) || 0);
  const max = Math.max(1, ...values);
  return (
    <div className="relative w-full h-[280px] flex flex-col">
      <div className="flex-1 grid grid-rows-4 gap-1 relative">
        <div className="border-b border-white/5" />
        <div className="border-b border-white/5" />
        <div className="border-b border-white/5" />
        <div className="border-b border-white/10" />
      </div>
      <div className="absolute inset-0 pt-2 pb-8 flex items-end justify-around">
        {(data || []).map((d, i) => {
          const pct = (Number(d.value) / max) * 100;
          const isPeak = Number(d.value) === max && values.length > 0;
          return (
            <div
              key={i}
              className="group flex-1 mx-1.5 flex flex-col items-center justify-end h-full"
            >
              <div className="relative w-full max-w-[36px] h-full flex items-end">
                <div
                  className={`w-full rounded-t-sm border transition-all ${
                    isPeak
                      ? 'bg-amber-400 border-amber-300 shadow-[0_0_18px_rgba(245,197,58,0.5)] group-hover:bg-amber-300'
                      : 'bg-surface-bright border-outline-variant group-hover:bg-amber-400/30'
                  }`}
                  style={{ height: `${Math.max(pct, 4)}%` }}
                />
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-label text-[9px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatNumber(d.value)}
                </span>
              </div>
              <span
                className={`absolute -bottom-1 font-label text-[10px] ${
                  isPeak ? 'text-on-surface' : 'text-on-surface-variant'
                }`}
              >
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CriticalStudentItem = ({ student }) => {
  const initial = (student.studentName?.[0] || '') + (student.studentSurname?.[0] || '');
  const count = Number(student.infractions || 0);
  const carnet = student.idCard || student._id;
  const severity = count >= 4 ? 'error' : count >= 2 ? 'warning' : 'secondary';
  return (
    <Link
      to={`/alerts/${carnet}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-surface-bright border border-white/5 flex items-center justify-center text-on-surface font-display font-semibold text-sm flex-shrink-0">
        {initial.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">
          {student.studentName} {student.studentSurname}
        </p>
        <p className="font-label text-[10px] text-on-surface-variant truncate">ID: {carnet}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <span
          className={`block font-display text-lg font-bold ${
            severity === 'error'
              ? 'text-error'
              : severity === 'warning'
                ? 'text-warning'
                : 'text-secondary'
          }`}
        >
          {formatNumber(count)}
        </span>
        <span className="font-label text-[9px] text-on-surface-variant">Veces</span>
      </div>
    </Link>
  );
};

const DashboardPage = () => {
  const [stats, setStats] = useState({
    objects: null,
    students: [],
    cameras: [],
    alerts: [],
    days: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const [objectsRes, studentsRes, camerasRes, alertsRes, daysRes] = await Promise.allSettled([
        statisticsApi.getObjects(),
        statisticsApi.getStudents(),
        camerasApi.getActive(),
        alertsApi.getAll({ limit: 5 }),
        statisticsApi.getDays(),
      ]);
      const isFatal = (r) => r.status === 'rejected' && !isNotFoundError(r.reason);
      if (
        isFatal(objectsRes) &&
        isFatal(studentsRes) &&
        isFatal(camerasRes) &&
        isFatal(alertsRes) &&
        isFatal(daysRes)
      ) {
        const reason = [objectsRes, studentsRes, camerasRes, alertsRes, daysRes].find(
          (r) => r.status === 'rejected'
        );
        setError(reason?.reason?.message || 'No se pudieron cargar las estadísticas');
      }
      setStats({
        objects:
          objectsRes.status === 'fulfilled' ? objectsRes.value?.data || objectsRes.value : null,
        students:
          studentsRes.status === 'fulfilled'
            ? studentsRes.value?.data || studentsRes.value || []
            : [],
        cameras:
          camerasRes.status === 'fulfilled'
            ? camerasRes.value.cameras || camerasRes.value.data || []
            : [],
        alerts:
          alertsRes.status === 'fulfilled'
            ? alertsRes.value.alerts || alertsRes.value.data || []
            : [],
        days: daysRes.status === 'fulfilled' ? daysRes.value?.data || daysRes.value : [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  const totals = stats.objects?.totals || {};
  const today = stats.objects?.today || {};
  const totalInfracciones = Number(totals.totalAlertas || 0);
  const totalDetecciones = Number(totals.totalAlertas || 0);
  const uniformeHoy = Number(today.uniformeIncompleto || 0);
  const alertasCriticas = useMemo(() => {
    return stats.alerts.filter((a) => a.status !== 'REPORTADO_A_COORDINACION').length;
  }, [stats.alerts]);

  const onlineCameras = stats.cameras.filter((c) => c.status === 'online').length;
  const totalCameras = stats.cameras.length;

  const weeklyChart = useMemo(() => {
    const raw = Array.isArray(stats.days) ? stats.days : stats.days?.data || [];
    if (raw.length === 0) return dayLabels.map((label) => ({ label, value: 0 }));
    return raw.slice(-7).map((d, i) => ({
      label: d.label || d.day || dayLabels[i] || `D${i + 1}`,
      value: Number(d.totalInfractions ?? d.count ?? d.value ?? 0),
    }));
  }, [stats.days]);

  const criticalStudents = useMemo(() => {
    const list = Array.isArray(stats.students) ? stats.students : stats.students?.data || [];
    return list.slice(0, 4);
  }, [stats.students]);

  const handleExport = () => {
    const hasData = totalInfracciones > 0 || uniformeHoy > 0;
    if (!hasData) {
      toast.error('Aún no hay detecciones para reportar');
      return;
    }
    setExportModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="CENTRO DE OPERACIONES"
        title="Tu centro de operaciones"
        withBrand
        description={`Lo que está pasando ahora en la plataforma. Sesión iniciada como ${ROLE_LABELS[role] || '—'}, ${user?.name || 'usuario'}.`}
        action={
          <div className="flex gap-2">
            <Button
              variant="primary"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExport}
              size="md"
            >
              Descargar reporte
            </Button>
          </div>
        }
      />

      <ExportReportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        type="Objects"
        statisticsApi={statisticsApi}
        currentUserEmail={user?.email || ''}
      />

      {error ? (
        <Card severity="error" glow="critical">
          <p className="text-sm text-error">{error}</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard
              icon={Hammer}
              label="Infracciones detectadas"
              value={formatNumber(totalInfracciones)}
              trend={totalInfracciones > 0 ? 'up' : 'flat'}
              trendLabel={totalInfracciones > 0 ? 'Acumulado del día' : 'Sin infracciones'}
              tone="warning"
              loading={loading}
            />
            <MetricCard
              icon={Shirt}
              label="Uniformes incompletos"
              value={formatNumber(totals.uniformeIncompleto || 0)}
              trend={totals.uniformeIncompleto > 0 ? 'up' : 'flat'}
              trendLabel="Acumulado histórico"
              tone="info"
              loading={loading}
            />
            <MetricCard
              icon={CheckSquare}
              label="Accesorios no permitidos"
              value={formatNumber(totals.accesoriosNoPermitidos || 0)}
              trend={totals.accesoriosNoPermitidos > 0 ? 'up' : 'flat'}
              trendLabel="Acumulado histórico"
              tone="success"
              loading={loading}
            />
            <MetricCard
              icon={AlertTriangle}
              label="Alertas pendientes"
              value={formatNumber(alertasCriticas)}
              trend={alertasCriticas > 0 ? 'up' : 'flat'}
              trendLabel="Requieren atención"
              tone="error"
              glow
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-[400px]">
            <Card className="lg:col-span-2" glass>
              <CardHeader
                title="Infracciones por día"
                description="Cuántas alertas se han generado en los últimos 7 días."
                action={
                  <div className="flex gap-3 font-label text-[10px] text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                      Pico
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-surface-bright border border-outline-variant" />
                      Normal
                    </span>
                  </div>
                }
              />
              <WeeklyChart data={weeklyChart} loading={loading} />
            </Card>

            <Card glass className="overflow-hidden p-0">
              <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-error/5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-error" />
                  <h3 className="font-display font-semibold text-on-surface text-base">
                    Estudiantes con más alertas
                  </h3>
                </div>
                <span className="bg-error/20 text-error font-label text-[10px] px-2 py-1 rounded-full">
                  Top {Math.min(4, criticalStudents.length)}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loading ? (
                  <>
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </>
                ) : criticalStudents.length === 0 ? (
                  <EmptyState
                    title="Sin alertas"
                    description="No hay estudiantes con infracciones acumuladas."
                    compact
                  />
                ) : (
                  criticalStudents.map((s, i) => (
                    <CriticalStudentItem
                      key={s.studentCard || s._id || i}
                      student={s}
                      position={i + 1}
                    />
                  ))
                )}
              </div>
              <Link
                to="/students"
                className="block text-center py-2.5 border-t border-white/5 font-label text-[10px] text-secondary hover:bg-white/5"
              >
                Ver todos los estudiantes
              </Link>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card glass>
              <CardHeader
                title="Cámaras en operación"
                description={`${onlineCameras} en línea de ${totalCameras} registradas.`}
              />
              <div className="flex items-center gap-3">
                <div className="text-3xl font-display font-bold text-amber-300 font-mono">
                  {onlineCameras}/{totalCameras}
                </div>
                <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success-bright rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]"
                    style={{
                      width: `${totalCameras > 0 ? (onlineCameras / totalCameras) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </Card>
            <Card glass>
              <CardHeader
                title="Cumplimiento del día"
                description="Uniforme correcto en las detecciones de hoy."
              />
              <div className="flex items-center gap-3">
                <div className="text-3xl font-display font-bold text-success-bright">
                  {uniformeHoy > 0 ? `${formatNumber(uniformeHoy)} infracciones` : '0 infracciones'}
                </div>
                <div className="flex-1 font-label text-[10px] text-on-surface-variant">
                  Uniforme incompleto detectado hoy
                </div>
              </div>
            </Card>
            <Card glass>
              <CardHeader
                title="Última detección"
                description="La alerta más reciente del sistema."
              />
              {stats.alerts.length === 0 ? (
                <p className="text-sm text-on-surface-dim">Sin actividad reciente.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-on-surface truncate">
                    {stats.alerts[0].studentName} {stats.alerts[0].studentSurname}
                  </p>
                  <p className="font-label text-[10px] text-on-surface-variant">
                    {stats.alerts[0].reason} · {formatRelativeTime(stats.alerts[0].lastDetection)}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
