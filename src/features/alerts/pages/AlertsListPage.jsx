import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, AlertTriangle } from 'lucide-react';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import { Card, Badge, Table, Input, Select, Button } from '../../../shared/components/ui/index.js';
import EmptyState from '../../../shared/components/feedback/EmptyState.jsx';
import ErrorState from '../../../shared/components/feedback/ErrorState.jsx';
import { alertService } from '../services/alertService.js';
import {
  ALERT_REASONS,
  ALERT_REASON_LABELS,
  ALERT_STATUSES,
  ALERT_STATUS_LABELS,
} from '../../../shared/utils/constants.js';
import { formatDateTime, formatRelativeTime } from '../../../shared/utils/formatters.js';

const variantByReason = {
  UNIFORME_INCOMPLETO: 'warning',
  ACCESORIO_NO_PERMITIDO: 'error',
};

const variantByStatus = {
  NOTIFICADO_ALUMNO: 'info',
  REPORTADO_A_COORDINACION: 'error',
};

const AlertsListPage = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await alertService.list();
      setAlerts(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (reasonFilter && a.reason !== reasonFilter) return false;
      if (statusFilter && a.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!a.studentCard?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [alerts, search, reasonFilter, statusFilter]);

  const columns = [
    {
      key: 'studentCard',
      header: 'Carnet',
      render: (row) => <span className="font-mono">{row.studentCard}</span>,
    },
    {
      key: 'reason',
      header: 'Motivo',
      render: (row) => (
        <Badge variant={variantByReason[row.reason] || 'default'}>
          {ALERT_REASON_LABELS[row.reason] || row.reason}
        </Badge>
      ),
    },
    {
      key: 'infractionCount',
      header: 'Conteo',
      align: 'center',
      render: (row) => <span className="font-label">{row.infractionCount}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (row) => (
        <Badge variant={variantByStatus[row.status] || 'default'}>
          {ALERT_STATUS_LABELS[row.status] || row.status}
        </Badge>
      ),
    },
    {
      key: 'lastDetection',
      header: 'Última detección',
      render: (row) => (
        <div>
          <p className="text-sm text-on-surface">{formatRelativeTime(row.lastDetection)}</p>
          <p className="text-[10px] text-on-surface-dim">{formatDateTime(row.lastDetection)}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (row) => (
        <Button size="xs" variant="primary" onClick={() => navigate(`/alerts/${row.studentCard}`)}>
          Ver historial
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Alertas" description="Historial diario de infracciones detectadas." />

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          leftIcon={<Search className="w-4 h-4" />}
          placeholder="Buscar por carnet"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          options={[
            { value: '', label: 'Todos los motivos' },
            ...ALERT_REASONS.map((r) => ({ value: r, label: ALERT_REASON_LABELS[r] })),
          ]}
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value)}
        />
        <Select
          options={[
            { value: '', label: 'Todos los estados' },
            ...ALERT_STATUSES.map((s) => ({ value: s, label: ALERT_STATUS_LABELS[s] })),
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      {error ? (
        <ErrorState description={error} onRetry={fetch} />
      ) : !loading && filtered.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Sin alertas"
          description="No se han registrado alertas con los filtros aplicados."
        />
      ) : (
        <Table columns={columns} rows={filtered} loading={loading} />
      )}
    </div>
  );
};

export default AlertsListPage;
