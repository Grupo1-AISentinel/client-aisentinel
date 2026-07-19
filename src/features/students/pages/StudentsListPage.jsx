import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Plus, User, Search, Edit, AlertCircle, CheckCircle } from 'lucide-react';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import {
  Button,
  Card,
  Skeleton,
  Pagination,
  Input,
  Select,
} from '../../../shared/components/ui/index.js';
import EmptyState from '../../../shared/components/feedback/EmptyState.jsx';
import ErrorState from '../../../shared/components/feedback/ErrorState.jsx';
import { useStudentsList } from '../hooks/useStudentsList.js';
import { useStudentStore } from '../stores/studentStore.js';
import { useAuthStore } from '../../auth/stores/authStore.js';
import { ROLES, GRADES } from '../../../shared/utils/constants.js';
import { formatGrade, formatDate, formatRelativeTime } from '../../../shared/utils/formatters.js';
import { cn } from '../../../shared/utils/cn.js';

const StudentCard = ({ student, onEdit }) => {
  const hasInfraction = (student.totalAlertas || 0) > 0;
  return (
    <div
      className={cn(
        'glass-card p-5 flex flex-col gap-3 relative overflow-hidden',
        hasInfraction && 'border-error/30'
      )}
    >
      {hasInfraction && <div className="absolute top-0 left-0 w-1 h-full bg-error" />}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
            hasInfraction
              ? 'bg-error/15 text-error border border-error/30'
              : 'bg-surface-container-high text-on-surface-variant border border-white/5'
          )}
        >
          <User className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm font-semibold text-on-surface truncate">
            {student.studentName} {student.studentSurname}
          </h3>
          <p className="font-mono text-[10px] text-on-surface-variant">STU-{student.idCard}</p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 font-label text-[9px] px-2 py-1 rounded-full border flex-shrink-0',
            hasInfraction
              ? 'bg-error/10 text-error border-error/30 glow-active'
              : 'bg-success/10 text-success-bright border-success/20'
          )}
        >
          {hasInfraction ? (
            <AlertCircle className="w-3 h-3" />
          ) : (
            <CheckCircle className="w-3 h-3" />
          )}
          {hasInfraction ? 'Infracción' : 'Cumple'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
        <div>
          <p className="font-label text-[9px] text-on-surface-variant">Grado</p>
          <p className="text-xs font-semibold text-on-surface mt-0.5">
            {formatGrade(student.grade)}
          </p>
        </div>
        <div>
          <p className="font-label text-[9px] text-on-surface-variant">
            {hasInfraction ? 'Detalle' : 'Último escaneo'}
          </p>
          <p
            className={cn(
              'text-xs font-semibold mt-0.5 truncate',
              hasInfraction ? 'text-error' : 'text-on-surface'
            )}
          >
            {hasInfraction
              ? student.topReason || 'Ver historial'
              : formatRelativeTime(student.lastDetection || student.updatedAt)}
          </p>
        </div>
        <div>
          <p className="font-label text-[9px] text-on-surface-variant">Infracciones</p>
          <p className="text-xs font-semibold text-on-surface mt-0.5">
            {student.totalAlertas ?? 0}
          </p>
        </div>
        <div>
          <p className="font-label text-[9px] text-on-surface-variant">Creado</p>
          <p className="text-xs font-semibold text-on-surface mt-0.5">
            {formatDate(student.createdAt)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onEdit(student)}
        className="w-full mt-1 inline-flex items-center justify-center gap-2 h-9 rounded-md border border-white/10 text-on-surface hover:bg-white/5 font-label text-[10px] transition-colors"
      >
        <Edit className="w-3.5 h-3.5" />
        Editar Estudiante
      </button>
    </div>
  );
};

const FilterPill = ({ label, active, onClick, count }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-2 px-4 py-1.5 rounded-full border font-label text-[10px] transition-colors',
      active
        ? 'bg-amber-400 text-amber-900 border-secondary'
        : 'bg-white/5 text-on-surface-variant border-white/10 hover:border-amber-400/40'
    )}
  >
    {label}
    {count !== undefined && (
      <span
        className={cn(
          'rounded-full px-1.5 min-w-[18px] text-center',
          active
            ? 'bg-on-secondary/15 text-on-secondary'
            : 'bg-surface-container text-on-surface-variant'
        )}
      >
        {count}
      </span>
    )}
  </button>
);

const StudentsListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { filters, setFilters, resetFilters } = useStudentStore();
  const role = useAuthStore((s) => s.role);
  const isCoordinator = role === ROLES.COORDINATOR;

  const { students, pagination, loading, error, refetch } = useStudentsList({
    page,
    limit: 12,
  });

  const totalPages = pagination.totalPages || 1;
  const totalRecords = pagination.totalRecords ?? students.length;

  const counts = useMemo(() => {
    const all = students.length;
    const infractions = students.filter((s) => (s.totalAlertas || 0) > 0).length;
    return { all, infractions };
  }, [students]);

  const handlePillClick = (pill) => {
    if (pill === 'all') {
      setFilters({ ...filters, hasAlertas: '' });
    } else if (pill === 'infractions') {
      setFilters({ ...filters, hasAlertas: 'true' });
    } else {
      setFilters({ ...filters, grade: pill });
    }
    setPage(1);
    refetch();
  };

  const pillActive = (pill) => {
    if (pill === 'all') return !filters.hasAlertas && !filters.grade;
    if (pill === 'infractions') return filters.hasAlertas === 'true';
    return filters.grade === pill;
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Lista de Estudiantes"
        description={
          isCoordinator
            ? `Solo puedes ver y gestionar estudiantes de tu grado asignado.`
            : 'Gestión de todos los estudiantes del sistema.'
        }
        action={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/students/create')}
          >
            Registrar Alumno
          </Button>
        }
      />

      <Card glass>
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
          <Input
            label="Buscar"
            leftIcon={<Search className="w-4 h-4" />}
            placeholder="Buscar por nombre o carnet"
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-1"
          />
          {!isCoordinator && (
            <Select
              label="Grado"
              options={[
                { value: '', label: 'Todos' },
                ...GRADES.map((g) => ({ value: g, label: g })),
              ]}
              value={filters.grade || ''}
              onChange={(e) => {
                setFilters({ ...filters, grade: e.target.value });
                setPage(1);
                refetch();
              }}
            />
          )}
          <Select
            label="Estado"
            options={[
              { value: '', label: 'Todos' },
              { value: 'true', label: 'Activos' },
              { value: 'false', label: 'Inactivos' },
            ]}
            value={filters.isActive ?? ''}
            onChange={(e) => {
              setFilters({ ...filters, isActive: e.target.value });
              setPage(1);
              refetch();
            }}
          />
          <Button
            variant="ghost"
            onClick={() => {
              resetFilters();
              setPage(1);
              refetch();
            }}
          >
            Limpiar
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <FilterPill
            label="Todos"
            active={pillActive('all')}
            onClick={() => handlePillClick('all')}
            count={counts.all}
          />
          {!isCoordinator &&
            GRADES.map((g) => (
              <FilterPill
                key={g}
                label={g}
                active={pillActive(g)}
                onClick={() => handlePillClick(g)}
              />
            ))}
          <FilterPill
            label="Con Infracciones"
            active={pillActive('infractions')}
            onClick={() => handlePillClick('infractions')}
            count={counts.infractions}
          />
        </div>
      </Card>

      {error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={User}
          title="Sin estudiantes"
          description={
            Object.values(filters).some((v) => v)
              ? 'Ningún estudiante coincide con los filtros aplicados.'
              : 'Aún no hay estudiantes registrados.'
          }
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/students/create')}
            >
              Crear el primero
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <StudentCard
                key={student._id || student.studentCard}
                student={student}
                onEdit={(s) => navigate(`/students/${s._id}?edit=1`)}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-on-surface-dim">
            <span>{totalRecords} resultado(s)</span>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
};

export default StudentsListPage;
