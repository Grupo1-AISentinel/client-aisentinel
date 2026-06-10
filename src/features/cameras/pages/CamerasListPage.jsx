import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { Plus, Search, LayoutGrid, List, CameraOff } from 'lucide-react';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import {
  Button,
  Input,
  Select,
  Skeleton,
  Pagination,
} from '../../../shared/components/ui/index.js';
import EmptyState from '../../../shared/components/feedback/EmptyState.jsx';
import ErrorState from '../../../shared/components/feedback/ErrorState.jsx';
import { useAuthStore } from '../../auth/stores/authStore.js';
import { ROLES } from '../../../shared/utils/constants.js';
import { cameraService } from '../services/cameraService.js';
import { CAMERA_SOURCES } from '../camera.constants.js';
import CameraCard from '../components/CameraCard.jsx';
import CameraForm from '../components/CameraForm.jsx';
import toast from 'react-hot-toast';

const CamerasListPage = () => {
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === ROLES.ADMIN;

  const [cameras, setCameras] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [view, setView] = useState('grid');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (source) params.source = source;
      const result = await cameraService.list(params);
      setCameras(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return undefined;
    /* eslint-disable react-hooks/set-state-in-effect */
    fetch();
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, source, isAdmin]);

  const [testingId, setTestingId] = useState(null);
  const [testingUnknownId, setTestingUnknownId] = useState(null);
  const handleTest = async (camera) => {
    setTestingId(camera._id);
    try {
      await cameraService.simulateAlert(camera.cameraId, {
        studentCard: 'TEST-001',
        studentName: 'Estudiante',
        studentSurname: 'Demo',
        reason: 'UNIFORME_INCOMPLETO',
        hasUniform: false,
        hasAccessory: false,
      });
      toast.success(`Detección simulada (conocido) → ${camera.cameraId}. Mira /monitoring`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTestingId(null);
    }
  };
  const handleTestUnknown = async (camera) => {
    setTestingUnknownId(camera._id);
    try {
      await cameraService.simulateAlert(camera.cameraId, {
        studentCard: null,
        hasUniform: false,
        hasAccessory: false,
      });
      toast.success(`Detección simulada (desconocido) → ${camera.cameraId}. Mira /monitoring`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTestingUnknownId(null);
    }
  };

  if (!isAdmin) return <Navigate to="/monitoring" replace />;

  const handleSaved = () => {
    toast.success('Cámara guardada');
    setEditing(null);
    setPage(1);
    fetch();
  };

  const handleRemove = async (camera) => {
    if (!window.confirm(`¿Desactivar la cámara ${camera.cameraId}?`)) return;
    try {
      await cameraService.remove(camera._id);
      toast.success('Cámara desactivada');
      fetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Cámaras"
        description="Gestión de cámaras. Solo el rol Administrador puede crear o modificar."
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-white/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setView('grid')}
                className={`p-2 ${view === 'grid' ? 'bg-amber-400/20 text-amber-300' : 'text-on-surface-variant hover:bg-white/5'}`}
                aria-label="Vista grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                className={`p-2 ${view === 'list' ? 'bg-amber-400/20 text-amber-300' : 'text-on-surface-variant hover:bg-white/5'}`}
                aria-label="Vista lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Nueva cámara
            </Button>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          leftIcon={<Search className="w-4 h-4" />}
          placeholder="Buscar por ID, nombre o ubicación"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          options={[{ value: '', label: 'Todas las fuentes' }, ...CAMERA_SOURCES]}
          value={source}
          onChange={(e) => {
            setPage(1);
            setSource(e.target.value);
          }}
        />
        <div className="flex items-center justify-end text-xs text-on-surface-dim font-mono">
          {pagination.totalRecords} cámara(s) registrada(s)
        </div>
      </div>

      {error ? (
        <ErrorState description={error} onRetry={fetch} />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : cameras.length === 0 ? (
        <EmptyState
          icon={CameraOff}
          title="Sin cámaras"
          description="Crea la primera cámara para empezar a monitorear."
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cameras.map((camera) => (
            <CameraCard
              key={camera._id}
              camera={camera}
              isAdmin={isAdmin}
              onEdit={(c) => {
                setEditing(c);
                setFormOpen(true);
              }}
              onRemove={handleRemove}
              onTest={handleTest}
              onTestUnknown={handleTestUnknown}
              testing={testingId === camera._id}
              testingUnknown={testingUnknownId === camera._id}
            />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {cameras.map((camera) => (
            <li key={camera._id}>
              <CameraCard
                camera={camera}
                isAdmin={isAdmin}
                onEdit={(c) => {
                  setEditing(c);
                  setFormOpen(true);
                }}
                onRemove={handleRemove}
              />
            </li>
          ))}
        </ul>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end">
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </div>
      )}

      <CameraForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initial={editing}
      />
    </div>
  );
};

export default CamerasListPage;
