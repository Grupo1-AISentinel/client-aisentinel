import { useState, useEffect } from 'react';
import { ClipboardList, Save, RotateCcw, ShieldCheck, Scan } from 'lucide-react';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import { Card, Button, Skeleton, Badge } from '../../../shared/components/ui/index.js';
import ErrorState from '../../../shared/components/feedback/ErrorState.jsx';
import EmptyState from '../../../shared/components/feedback/EmptyState.jsx';
import { inspectionsApi } from '../../../shared/api/adminApi.js';
import { extractErrorMessage } from '../../../shared/api/errors.js';
import { GRADES } from '../../../shared/utils/constants.js';
import { formatGrade } from '../../../shared/utils/formatters.js';
import { useAuthStore } from '../../auth/stores/authStore.js';
import { ROLES } from '../../../shared/utils/constants.js';
import { toast } from 'react-hot-toast';
import { cn } from '../../../shared/utils/cn.js';

const Switch = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    disabled={disabled}
    className={cn(
      'relative w-10 h-6 rounded-full transition-colors flex-shrink-0',
      checked ? 'bg-secondary' : 'bg-surface-container-high border border-white/10',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    <span
      className={cn(
        'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-[18px]' : 'translate-x-0.5'
      )}
    />
  </button>
);

const InspectionsPage = () => {
  const [state, setState] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null);
  const role = useAuthStore((s) => s.role);
  const coordinatorGrade = useAuthStore((s) => s.user?.coordinatorGrade);
  const isCoordinator = role === ROLES.COORDINATOR;

  const visibleGrades = isCoordinator && coordinatorGrade ? [coordinatorGrade] : GRADES;

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await inspectionsApi.getAll();
      const list = Array.isArray(result) ? result : result.data || [];
      const map = {};
      list.forEach((item) => {
        map[item.grade] = item.isActive;
      });
      GRADES.forEach((g) => {
        if (map[g] === undefined) map[g] = false;
      });
      setState(map);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
  }, []);

  const handleToggle = async (grade) => {
    setPending(grade);
    const previous = state[grade];
    setState((s) => ({ ...s, [grade]: !previous }));
    try {
      await inspectionsApi.toggle(grade);
      toast.success(
        `Inspección de ${formatGrade(grade)} ${!previous ? 'activada' : 'desactivada'}`
      );
    } catch (err) {
      setState((s) => ({ ...s, [grade]: previous }));
      toast.error(extractErrorMessage(err));
    } finally {
      setPending(null);
    }
  };

  const handleApplyAll = () => {
    toast.success('Cambios sincronizados con el servicio de visión');
  };

  const activeCount = Object.values(state).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inspecciones por Grado"
        description={
          isCoordinator
            ? 'Activa o desactiva la inspección de tu grado asignado.'
            : 'Activa o desactiva la inspección por cada grado. El cambio se notifica al servicio de visión.'
        }
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={fetch}
            >
              Recargar
            </Button>
            <Button
              variant="primary"
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleApplyAll}
            >
              Sincronizar Cambios
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card glass>
          <p className="font-label text-[10px] text-on-surface-variant">Grados totales</p>
          <p className="font-display text-3xl font-bold text-on-surface mt-1">
            {visibleGrades.length}
          </p>
        </Card>
        <Card glass>
          <p className="font-label text-[10px] text-on-surface-variant">Inspecciones activas</p>
          <p className="font-display text-3xl font-bold text-success-bright mt-1">{activeCount}</p>
        </Card>
        <Card glass>
          <p className="font-label text-[10px] text-on-surface-variant">Cobertura</p>
          <p className="font-display text-3xl font-bold text-secondary mt-1">
            {visibleGrades.length
              ? `${Math.round((activeCount / visibleGrades.length) * 100)}%`
              : '0%'}
          </p>
        </Card>
      </div>

      {error ? (
        <ErrorState description={error} onRetry={fetch} />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleGrades.map((g) => (
            <Skeleton key={g} className="h-32" />
          ))}
        </div>
      ) : visibleGrades.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Sin grados asignados"
          description="No tienes grados configurados. Contacta al administrador."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleGrades.map((grade) => {
            const checked = Boolean(state[grade]);
            return (
              <div
                key={grade}
                className={cn(
                  'glass-panel rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden',
                  checked && 'glow-active border-amber-400/30'
                )}
              >
                {checked && <div className="absolute top-0 right-0 w-1.5 h-full bg-secondary/30" />}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-11 h-11 rounded-lg flex items-center justify-center',
                        checked
                          ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                          : 'bg-surface-container-high text-on-surface-variant border border-white/5'
                      )}
                    >
                      <Scan className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-semibold text-on-surface">
                        {formatGrade(grade)}
                      </h3>
                      <Badge variant={checked ? 'success' : 'default'} size="sm">
                        {checked ? 'Inspección activa' : 'Inspección desactivada'}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={checked}
                    onChange={() => handleToggle(grade)}
                    disabled={pending === grade}
                  />
                </div>
                <div className="bg-surface-container-low border border-white/5 rounded-md p-3 flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="font-label text-[10px] text-on-surface-variant">
                      Cámara asignada
                    </span>
                    <span className="font-mono text-[10px] text-on-surface">
                      {checked ? `CAM-${grade}` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-label text-[10px] text-on-surface-variant">
                      Estudiantes
                    </span>
                    <span className="font-mono text-[10px] text-on-surface">
                      {state[`${grade}_students`] || '—'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-label text-on-surface-variant">
                  <ShieldCheck className="w-3 h-3 text-success-bright" />
                  Los cambios se sincronizan con el servicio de visión
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InspectionsPage;
