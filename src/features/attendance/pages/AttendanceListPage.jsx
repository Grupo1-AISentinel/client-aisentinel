import { useEffect, useState, useMemo } from 'react';
import {
  Calendar,
  ChevronDown,
  Search,
  User,
  CheckCircle,
  Clock,
  Ban,
  AlertTriangle,
  Eye,
  Download,
} from 'lucide-react';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import {
  Card,
  Badge,
  Skeleton,
  Input,
  Select,
  Button,
} from '../../../shared/components/ui/index.js';
import EmptyState from '../../../shared/components/feedback/EmptyState.jsx';
import ErrorState from '../../../shared/components/feedback/ErrorState.jsx';
import { attendanceService } from '../services/attendanceService.js';
import { formatTime, formatDate, formatGrade } from '../../../shared/utils/formatters.js';
import { GRADES } from '../../../shared/utils/constants.js';
import { cn } from '../../../shared/utils/cn.js';
import { toast } from 'react-hot-toast';

const STATUS = {
  PRESENTE: { label: 'PRESENTE', variant: 'success', icon: CheckCircle },
  RETRASO: { label: 'RETRASO', variant: 'warning', icon: Clock },
  AUSENTE: { label: 'AUSENTE', variant: 'default', icon: Ban },
  DESCONOCIDO: { label: 'DESCONOCIDO', variant: 'error', icon: AlertTriangle },
};

const detectStatus = (entry) => {
  if (entry.status) return entry.status;
  if (!entry.checkIn) return 'AUSENTE';
  const checkInDate = new Date(entry.checkIn);
  const limit = new Date();
  limit.setHours(8, 15, 0, 0);
  if (checkInDate > limit) return 'RETRASO';
  return 'PRESENTE';
};

const StatusBadge = ({ status, minutesLate }) => {
  const s = STATUS[status] || STATUS.PRESENTE;
  const Icon = s.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded font-label text-[10px] border',
        s.variant === 'success' && 'bg-success/10 text-success-bright border-success/20',
        s.variant === 'warning' && 'bg-warning/10 text-warning border-warning/20',
        s.variant === 'error' && 'bg-error/10 text-error border-error/30',
        s.variant === 'default' && 'bg-white/5 text-on-surface-variant border-white/10'
      )}
    >
      <Icon className="w-3 h-3" />
      {s.label}
      {status === 'RETRASO' && minutesLate !== undefined && (
        <span className="ml-1 text-warning">+{minutesLate}m</span>
      )}
    </span>
  );
};

const SummaryCard = ({ label, value, total, color = 'success' }) => {
  const colorMap = {
    success: 'border-success-bright',
    warning: 'border-warning',
    error: 'border-error',
    neutral: 'border-on-surface-variant',
  };
  const textMap = {
    success: 'text-success-bright',
    warning: 'text-warning',
    error: 'text-error',
    neutral: 'text-on-surface',
  };
  return (
    <div
      className={cn('glass-panel rounded-md p-4 border-l-4 flex flex-col gap-1', colorMap[color])}
    >
      <p className="font-label text-[10px] text-on-surface-variant">{label}</p>
      <p className={cn('font-display text-2xl font-bold', textMap[color])}>{value}</p>
      {total !== undefined && (
        <p className="font-mono text-[10px] text-on-surface-variant">
          {total > 0 ? `${Math.round((value / total) * 100)}%` : '0%'}
        </p>
      )}
    </div>
  );
};

const AttendanceListPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().slice(0, 10),
    grade: '',
    status: '',
    search: '',
  });

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await attendanceService.getDaily();
      setData(Array.isArray(result) ? result : result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, []);

  const enriched = useMemo(() => {
    return data.map((row) => {
      const status = detectStatus(row);
      const checkIn = row.checkIn ? new Date(row.checkIn) : null;
      const minutesLate = checkIn
        ? Math.max(
            0,
            Math.round((checkIn.getTime() - new Date(checkIn).setHours(8, 15, 0, 0)) / 60000)
          )
        : 0;
      return { ...row, _status: status, _minutesLate: minutesLate };
    });
  }, [data]);

  const filtered = useMemo(() => {
    return enriched.filter((row) => {
      if (filters.grade && row.student?.grade !== filters.grade) return false;
      if (filters.status && row._status !== filters.status) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const fullName =
          `${row.student?.studentName || ''} ${row.student?.studentSurname || ''}`.toLowerCase();
        const card = String(row.studentCard || '').toLowerCase();
        if (!fullName.includes(q) && !card.includes(q)) return false;
      }
      return true;
    });
  }, [enriched, filters]);

  const summary = useMemo(() => {
    const total = enriched.length;
    const presentes = enriched.filter((r) => r._status === 'PRESENTE').length;
    const retrasos = enriched.filter((r) => r._status === 'RETRASO').length;
    const desconocidos = enriched.filter((r) => r._status === 'DESCONOCIDO').length;
    const ausentes = enriched.filter((r) => r._status === 'AUSENTE').length;
    return { total, presentes, retrasos, desconocidos, ausentes };
  }, [enriched]);

  const handleExport = () => {
    toast.success(`Generando reporte del ${formatDate(filters.date)}…`);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Gestión de Asistencias"
        description={`Registro de ingresos del ${formatDate(new Date())} · ${summary.total} detecciones`}
        action={
          <Button
            variant="primary"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Exportar Reporte
          </Button>
        }
      />

      <Card glass>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="font-label text-[10px] text-on-surface-variant ml-1 mb-1.5 block">
              Fecha
            </label>
            <div className="input-glow rounded-md h-11 px-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-on-surface-variant" />
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="bg-transparent outline-none text-sm text-on-surface flex-1"
              />
            </div>
          </div>
          <Select
            label="Grado / Sección"
            options={[
              { value: '', label: 'Todos' },
              ...GRADES.map((g) => ({ value: g, label: g })),
            ]}
            value={filters.grade}
            onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
            leftIcon={<ChevronDown className="w-4 h-4" />}
          />
          <Select
            label="Estado de Ingreso"
            options={[
              { value: '', label: 'Todos' },
              { value: 'PRESENTE', label: 'Presente' },
              { value: 'RETRASO', label: 'Retraso' },
              { value: 'AUSENTE', label: 'Ausente' },
              { value: 'DESCONOCIDO', label: 'Desconocido' },
            ]}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            leftIcon={<ChevronDown className="w-4 h-4" />}
          />
          <Input
            label="Buscar Estudiante"
            leftIcon={<Search className="w-4 h-4" />}
            placeholder="Nombre o carnet"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
      </Card>

      {error ? (
        <ErrorState description={error} onRetry={fetch} />
      ) : (
        <>
          <Card glass className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-container/70 sticky top-0 z-10">
                  <tr className="text-on-surface-variant font-label text-[10px] border-b border-white/5">
                    <th className="text-left p-3">Estudiante</th>
                    <th className="text-left p-3">Carnet</th>
                    <th className="text-left p-3">Grado</th>
                    <th className="text-left p-3">Hora de Ingreso</th>
                    <th className="text-left p-3">Estado</th>
                    <th className="text-right p-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td colSpan="6" className="p-2">
                          <Skeleton className="h-9 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-6">
                        <EmptyState
                          icon={User}
                          title="Sin ingresos"
                          description="No hay ingresos que coincidan con los filtros aplicados."
                          compact
                        />
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => {
                      const isUnknown = row._status === 'DESCONOCIDO';
                      return (
                        <tr
                          key={row._id || row.studentCard}
                          className={cn(
                            'border-b border-white/5 hover:bg-white/5 transition-colors',
                            isUnknown && 'band-error bg-error/5 glow-error',
                            row._status === 'AUSENTE' && 'opacity-60'
                          )}
                        >
                          <td className="p-3">
                            <p className="font-semibold text-on-surface">
                              {row.student?.studentName || 'Desconocido'}{' '}
                              {row.student?.studentSurname || ''}
                            </p>
                            {isUnknown && (
                              <p className="font-label text-[9px] text-error mt-0.5">
                                ALERTA IA: ROSTRO OCULTO
                              </p>
                            )}
                          </td>
                          <td className="p-3 font-mono text-xs text-on-surface-variant">
                            {row.studentCard || '—'}
                          </td>
                          <td className="p-3">
                            {row.student?.grade ? (
                              <Badge variant="info" size="sm">
                                {formatGrade(row.student.grade)}
                              </Badge>
                            ) : (
                              <span className="text-on-surface-dim text-xs">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            <p className="text-on-surface text-sm">
                              {row.checkIn ? formatTime(row.checkIn) : '—'}
                            </p>
                            <p className="font-label text-[9px] text-on-surface-variant">
                              {row.checkIn ? formatDate(row.checkIn) : '—'}
                            </p>
                          </td>
                          <td className="p-3">
                            <StatusBadge status={row._status} minutesLate={row._minutesLate} />
                          </td>
                          <td className="p-3 text-right">
                            {isUnknown ? (
                              <Button variant="danger" size="sm">
                                Revisar
                              </Button>
                            ) : (
                              <button
                                type="button"
                                className="text-on-surface-variant hover:text-secondary p-1.5 rounded hover:bg-white/5"
                                aria-label="Ver detalle"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard
              label="Presentes"
              value={summary.presentes}
              total={summary.total}
              color="success"
            />
            <SummaryCard
              label="Retrasos"
              value={summary.retrasos}
              total={summary.total}
              color="warning"
            />
            <SummaryCard
              label="Errores IA"
              value={summary.desconocidos}
              total={summary.total}
              color="error"
            />
            <SummaryCard
              label="Ausentes"
              value={summary.ausentes}
              total={summary.total}
              color="neutral"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceListPage;
