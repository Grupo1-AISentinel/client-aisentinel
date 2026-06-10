import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Shirt, CheckCircle, Check, X, SlidersHorizontal } from 'lucide-react';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import { Button, Card, Badge, Select, Skeleton } from '../../../shared/components/ui/index.js';
import EmptyState from '../../../shared/components/feedback/EmptyState.jsx';
import ErrorState from '../../../shared/components/feedback/ErrorState.jsx';
import { uniformService } from '../services/uniformService.js';
import { UNIFORM_TYPES, UNIFORM_TYPE_LABELS } from '../../../shared/utils/constants.js';
import { toast } from 'react-hot-toast';
import { cn } from '../../../shared/utils/cn.js';

const ICON_BY_TYPE = {
  JACKET: CheckCircle,
  TSHIRT: Shirt,
  PANTS: Shirt,
};

const UniformCard = ({ uniform, onToggle, isActive }) => {
  const Icon = ICON_BY_TYPE[uniform.type] || Shirt;
  return (
    <div
      className={cn(
        'glass-panel rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden',
        isActive && 'glow-active border-amber-400/30'
      )}
    >
      {isActive && <div className="absolute top-0 right-0 w-2 h-full bg-secondary/20" />}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-11 h-11 rounded-lg flex items-center justify-center',
              isActive
                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                : 'bg-surface-container-high text-on-surface-variant border border-white/5'
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-on-surface">{uniform.name}</h3>
            <p className="font-label text-[10px] text-on-surface-variant">
              {UNIFORM_TYPE_LABELS[uniform.type] || uniform.type}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={uniform.isActive}
          onClick={() => onToggle(uniform)}
          className={cn(
            'relative w-10 h-6 rounded-full transition-colors flex-shrink-0',
            uniform.isActive ? 'bg-secondary' : 'bg-surface-container-high border border-white/10'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
              uniform.isActive ? 'translate-x-[18px]' : 'translate-x-0.5'
            )}
          />
        </button>
      </div>

      {uniform.imageUrl && (
        <div className="aspect-video bg-surface-container-lowest border border-white/5 rounded-md overflow-hidden">
          <img
            src={uniform.imageUrl}
            alt={uniform.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="bg-surface-container-low border border-white/5 rounded-md p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-label text-[10px] text-on-surface-variant">Estado</span>
          <Badge variant={uniform.isActive ? 'success' : 'default'} size="sm">
            {uniform.isActive ? 'Disponible para detección' : 'Inactivo'}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-label text-[10px] text-on-surface-variant">Tipo</span>
          <span className="font-mono text-[10px] text-on-surface">
            {UNIFORM_TYPE_LABELS[uniform.type] || uniform.type}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="text-secondary hover:text-secondary-fixed font-label text-[10px] inline-flex items-center gap-1 self-start"
      >
        <SlidersHorizontal className="w-3 h-3" /> Ajustar parámetros
      </button>
    </div>
  );
};

const AccessoryRule = ({ name, allowed, description }) => (
  <div
    className={cn(
      'flex items-center gap-3 p-3 rounded-md border',
      allowed ? 'bg-success/5 border-success/20' : 'bg-error/5 border-error/30 band-error'
    )}
  >
    <div
      className={cn(
        'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0',
        allowed
          ? 'bg-success/15 text-success-bright border border-success/30'
          : 'bg-error/15 text-error border border-error/30'
      )}
    >
      {allowed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-on-surface">{name}</p>
      {description && (
        <p className="font-label text-[10px] text-on-surface-variant truncate">{description}</p>
      )}
    </div>
    <Badge variant={allowed ? 'success' : 'error'} size="sm">
      {allowed ? 'PERMITIDO' : 'PROHIBIDO'}
    </Badge>
  </div>
);

const UniformsListPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ type: '', isActive: '' });

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filter.type) params.type = filter.type;
      if (filter.isActive) params.isActive = filter.isActive;
      const result = await uniformService.list({ ...params, limit: 50 });
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.type, filter.isActive]);

  const handleToggle = async (uniform) => {
    try {
      await uniformService.toggleActive(uniform);
      toast.success(uniform.isActive ? 'Uniforme desactivado' : 'Uniforme activado');
      fetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const allowedAccessories = [
    { name: 'Reloj discreto', description: 'Sin pulseras adicionales', allowed: true },
    { name: 'Credencial oficial', description: 'Visible y al día', allowed: true },
    { name: 'Mochila institucional', description: 'Color azul marino o negro', allowed: true },
  ];

  const prohibitedAccessories = [
    { name: 'Gorra o sombrero', description: 'Excepto protección solar médica', allowed: false },
    { name: 'Aretes / piercing facial', description: 'Restringidos en el aula', allowed: false },
    { name: 'Cadenas o pulseras', description: 'Distractores en clase', allowed: false },
    { name: 'Auriculares visibles', description: 'Solo dentro del aula', allowed: false },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Normativas de Uniforme"
        description="Catálogo de prendas validadas y accesorios permitidos por la IA."
        action={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/uniforms/create')}
          >
            Registrar Prenda
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          label="Tipo de prenda"
          options={[
            { value: '', label: 'Todos los tipos' },
            ...UNIFORM_TYPES.map((t) => ({ value: t, label: UNIFORM_TYPE_LABELS[t] })),
          ]}
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
        />
        <Select
          label="Estado"
          options={[
            { value: '', label: 'Todos' },
            { value: 'true', label: 'Activos' },
            { value: 'false', label: 'Inactivos' },
          ]}
          value={filter.isActive}
          onChange={(e) => setFilter({ ...filter, isActive: e.target.value })}
        />
      </div>

      {error ? (
        <ErrorState description={error} onRetry={fetch} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Shirt}
          title="Sin uniformes"
          description="No hay prendas registradas con los filtros aplicados."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((u, i) => (
            <UniformCard
              key={u._id}
              uniform={u}
              onToggle={handleToggle}
              isActive={i === 0 && u.isActive}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card glass>
          <h3 className="font-display text-base text-on-surface mb-1 flex items-center gap-2">
            <Check className="w-4 h-4 text-success-bright" />
            Accesorios Permitidos
          </h3>
          <p className="font-label text-[10px] text-on-surface-variant mb-4">
            Autorizados por normativa institucional
          </p>
          <div className="space-y-2">
            {allowedAccessories.map((a) => (
              <AccessoryRule key={a.name} {...a} />
            ))}
          </div>
        </Card>

        <Card glass severity="error">
          <h3 className="font-display text-base text-on-surface mb-1 flex items-center gap-2">
            <X className="w-4 h-4 text-error" />
            Prohibidos · ALERTA IA
          </h3>
          <p className="font-label text-[10px] text-on-surface-variant mb-4">
            Generarán una alerta automática al ser detectados
          </p>
          <div className="space-y-2">
            {prohibitedAccessories.map((a) => (
              <AccessoryRule key={a.name} {...a} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UniformsListPage;
