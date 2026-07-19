import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import { Button, Card, Badge, Skeleton } from '../../../shared/components/ui/index.js';
import ErrorState from '../../../shared/components/feedback/ErrorState.jsx';
import EmptyState from '../../../shared/components/feedback/EmptyState.jsx';
import { alertService } from '../services/alertService.js';
import { formatDateTime, formatRelativeTime } from '../../../shared/utils/formatters.js';
import { ALERT_REASON_LABELS, ALERT_STATUS_LABELS } from '../../../shared/utils/constants.js';

const AlertDetailPage = () => {
  const { idCard } = useParams();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await alertService.getByIdCard(idCard);
        setAlerts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idCard]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) return <ErrorState description={error} onRetry={() => navigate('/alerts')} />;

  return (
    <div>
      <PageHeader
        title={`Alertas · ${idCard}`}
        description="Historial completo de infracciones registradas para este carnet."
        action={
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/alerts')}
          >
            Volver
          </Button>
        }
      />

      {alerts.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Sin infracciones"
          description="No se han registrado infracciones para este carnet."
        />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card
              key={alert._id}
              severity={alert.reason === 'UNIFORME_INCOMPLETO' ? 'warning' : 'error'}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-sm text-on-surface-variant">
                    {formatDateTime(alert.lastDetection)} ·{' '}
                    {formatRelativeTime(alert.lastDetection)}
                  </p>
                  <h3 className="text-base font-display font-semibold text-on-surface mt-1">
                    {ALERT_REASON_LABELS[alert.reason] || alert.reason}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Conteo: {alert.infractionCount}</Badge>
                  <Badge variant={alert.status === 'REPORTADO_A_COORDINACION' ? 'error' : 'info'}>
                    {ALERT_STATUS_LABELS[alert.status] || alert.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertDetailPage;
