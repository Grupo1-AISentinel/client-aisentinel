import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus } from 'lucide-react';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import {
  Button,
  Card,
  Table,
  Pagination,
  Modal,
  ModalFooter,
  Input,
  Select,
} from '../../../shared/components/ui/index.js';
import EmptyState from '../../../shared/components/feedback/EmptyState.jsx';
import ErrorState from '../../../shared/components/feedback/ErrorState.jsx';
import { coordinatorService } from '../services/coordinatorService.js';
import { useAuthStore } from '../../auth/stores/authStore.js';
import { GRADES } from '../../../shared/utils/constants.js';
import { formatDate, formatGrade } from '../../../shared/utils/formatters.js';
import toast from 'react-hot-toast';

const buildColumns = ({ onToggle, onDelete }) => [
  {
    key: 'name',
    header: 'Nombre',
    render: (row) => (
      <div>
        <p className="font-medium text-on-surface">
          {row.firstName} {row.lastName}
        </p>
        <p className="text-xs text-on-surface-dim">{row.email}</p>
      </div>
    ),
  },
  {
    key: 'grade',
    header: 'Grado',
    render: (row) => <span className="font-label">{formatGrade(row.grade)}</span>,
  },
  { key: 'phone', header: 'Teléfono' },
  {
    key: 'isActive',
    header: 'Estado',
    render: (row) => (
      <span
        className={`inline-flex items-center gap-1.5 text-xs h-6 px-2.5 rounded-full font-label ${
          row.isActive
            ? 'bg-success/15 text-success border border-success/30'
            : 'bg-surface-bright text-on-surface-variant border border-outline-soft'
        }`}
      >
        {row.isActive ? 'Activo' : 'Inactivo'}
      </span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Creado',
    render: (row) => (
      <span className="text-xs text-on-surface-dim">{formatDate(row.createdAt)}</span>
    ),
  },
  {
    key: 'actions',
    header: 'Acciones',
    align: 'right',
    render: (row) => (
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onToggle(row)}
          className="text-xs text-on-surface-variant hover:underline"
        >
          {row.isActive ? 'Desactivar' : 'Activar'}
        </button>
        <button
          type="button"
          onClick={() => onDelete(row)}
          className="text-xs text-error hover:underline"
        >
          Eliminar
        </button>
      </div>
    ),
  },
];

const AdminForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'admin' ? 'admin' : 'coordinator';
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const form = useForm({ mode: 'onBlur' });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      if (mode === 'admin') {
        await coordinatorService.createAdmin(values);
        toast.success('Administrador creado');
      } else {
        await coordinatorService.create(values);
        toast.success('Coordinador creado');
      }
      setOpen(false);
      navigate('/coordinators');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => {
        setOpen(false);
        navigate('/coordinators');
      }}
      title={mode === 'admin' ? 'Nuevo administrador' : 'Nuevo coordinador'}
      description="Crea una cuenta con acceso al panel."
      size="md"
    >
      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={mode === 'coordinator' ? 'primary' : 'ghost'}
          onClick={() => {
            setMode('coordinator');
            reset();
          }}
        >
          Coordinador
        </Button>
        <Button
          size="sm"
          variant={mode === 'admin' ? 'primary' : 'ghost'}
          onClick={() => {
            setMode('admin');
            reset();
          }}
        >
          Administrador
        </Button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre"
          required
          error={errors.name?.message}
          {...register('name', { required: 'Requerido', maxLength: 25 })}
        />
        <Input
          label="Apellido"
          required
          error={errors.surname?.message}
          {...register('surname', { required: 'Requerido', maxLength: 25 })}
        />
        <Input
          label="Usuario"
          required
          error={errors.username?.message}
          {...register('username', { required: 'Requerido', maxLength: 50 })}
        />
        <Input
          label="Correo"
          type="email"
          required
          error={errors.email?.message}
          {...register('email', {
            required: 'Requerido',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
          })}
        />
        <Input
          label="Teléfono"
          error={errors.phone?.message}
          {...register('phone', {
            validate: (v) => !v || /^\d{8}$/.test(v) || 'Debe tener 8 dígitos',
          })}
        />
        {mode === 'coordinator' && (
          <Select
            label="Grado"
            required
            options={GRADES.map((g) => ({ value: g, label: g }))}
            error={errors.grade?.message}
            {...register('grade', { required: 'Selecciona un grado' })}
          />
        )}
        <Input
          label="Contraseña"
          type="password"
          required
          error={errors.password?.message}
          {...register('password', {
            required: 'Requerido',
            minLength: { value: 8, message: 'Mínimo 8 caracteres' },
          })}
          wrapperClassName="md:col-span-2"
        />
        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              setOpen(false);
              navigate('/coordinators');
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {mode === 'admin' ? 'Crear administrador' : 'Crear coordinador'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const CoordinatorsListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === 'ADMIN_ROLE';

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await coordinatorService.list({ page, limit: 10 });
      setData(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleToggle = async (row) => {
    try {
      await coordinatorService.toggleActive(row);
      toast.success(row.isActive ? 'Coordinador desactivado' : 'Coordinador activado');
      fetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`¿Eliminar a ${row.firstName} ${row.lastName}?`)) return;
    try {
      await coordinatorService.remove(row._id);
      toast.success('Coordinador eliminado');
      fetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = buildColumns({ onToggle: handleToggle, onDelete: handleDelete });

  return (
    <div>
      <PageHeader
        title="Coordinadores"
        description="Gestiona los coordinadores asignados a cada grado."
        action={
          isAdmin && (
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setSearchParams({ mode: 'coordinator' })}
            >
              Nuevo
            </Button>
          )
        }
      />

      {error ? (
        <ErrorState description={error} onRetry={fetch} />
      ) : !loading && data.length === 0 ? (
        <EmptyState
          title="Sin coordinadores"
          description="Crea el primer coordinador para empezar a asignar grados."
        />
      ) : (
        <>
          <Table columns={columns} rows={data} loading={loading} />
          <div className="mt-4 flex items-center justify-end">
            <Pagination
              page={page}
              totalPages={pagination.totalPages || 1}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      {searchParams.get('mode') && <AdminForm />}
    </div>
  );
};

export default CoordinatorsListPage;
