import {
  ShieldIcon,
  ServerIcon,
  BrainIcon,
  ErrorIcon,
  WarningIcon,
  CheckIcon,
} from '../../../../shared/components/docs/index.js';
import Card, { CardHeader } from '../../../../shared/components/ui/Card.jsx';
import Badge from '../../../../shared/components/ui/Badge.jsx';
import { SchemaTable, buildSchemaColumns } from '../../../../shared/components/docs/index.js';
import { envVariables } from '../../data/envConfig.js';
import { cn } from '../../../../shared/utils/cn.js';

const SERVICE_META = {
  'server-auth-aisentinel': {
    icon: ShieldIcon,
    title: 'Auth Service',
    port: '3069',
    color: 'text-sky-300',
    ring: 'border-sky-400/30 hover:border-sky-400/60',
  },
  'server-admin-aisentinel': {
    icon: ServerIcon,
    title: 'Admin Service',
    port: '3067',
    color: 'text-amber-300',
    ring: 'border-amber-400/30 hover:border-amber-400/60',
  },
  'server-pyimage-aisentinel': {
    icon: BrainIcon,
    title: 'Pyimage Service',
    port: '8000',
    color: 'text-violet-300',
    ring: 'border-violet-400/30 hover:border-violet-400/60',
  },
};

const PillReq = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label text-[10px] border bg-rose-500/10 text-rose-300 border-rose-500/30">
    REQ
  </span>
);
const PillOpt = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label text-[10px] border bg-sky-500/10 text-sky-300 border-sky-500/30">
    OPC
  </span>
);

const EnvCard = ({ groupKey, group }) => {
  const meta = SERVICE_META[groupKey];
  const Icon = meta.icon;
  const required = group.vars.filter((v) => v.required).length;
  return (
    <Card className={cn('group transition-all', meta.ring)}>
      <div className="flex items-start gap-3 mb-4 flex-wrap">
        <div
          className={cn(
            'shrink-0 w-12 h-12 rounded-lg border flex items-center justify-center',
            meta.color
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-base font-bold text-on-surface">{group.title}</h3>
            <Badge size="sm" variant="default">
              :{meta.port}
            </Badge>
          </div>
          <p className="text-[12.5px] text-on-surface-variant mt-1 leading-relaxed">
            {group.description}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-on-surface-dim">
          <span className="font-mono">{group.vars.length} vars</span>
          <span>·</span>
          <span className="font-mono text-rose-300">{required} req</span>
        </div>
      </div>
      <SchemaTable
        columns={buildSchemaColumns({ withConstraints: false })}
        rows={group.vars.map((v) => ({
          name: v.name,
          type: v.required ? 'required' : 'optional',
          required: v.required,
          defaultValue: v.default,
          description: v.description,
        }))}
      />
    </Card>
  );
};

const SECRET_META = {
  critical: {
    bg: 'bg-rose-500/5',
    border: 'border-rose-500/30',
    icon: ErrorIcon,
    color: 'text-rose-300',
  },
  important: {
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/30',
    icon: WarningIcon,
    color: 'text-amber-300',
  },
  info: { bg: 'bg-sky-500/5', border: 'border-sky-500/30', icon: CheckIcon, color: 'text-sky-300' },
};

const SecretItem = ({ severity, text }) => {
  const m = SECRET_META[severity];
  const Icon = m.icon;
  return (
    <div className={cn('flex items-start gap-2.5 p-3 rounded-md border', m.bg, m.border)}>
      <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', m.color)} />
      <span className="text-on-surface-variant leading-relaxed text-[13px]">{text}</span>
    </div>
  );
};

const EnvConfigSection = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader title="Variables de entorno" description="Configuración de los tres servicios." />
      <p className="text-sm text-on-surface-variant leading-relaxed">
        Cada servicio tiene su propio <code className="font-mono text-amber-300">.env</code>.
        <span className="inline-flex items-center gap-1 mx-1.5 align-middle">
          <PillReq /> <span className="text-[12px]">obligatoria</span>
        </span>
        <span className="inline-flex items-center gap-1 mx-1.5 align-middle">
          <PillOpt /> <span className="text-[12px]">con valor por defecto</span>
        </span>
      </p>
    </Card>

    <div className="grid grid-cols-1 gap-4">
      {Object.entries(envVariables).map(([k, g]) => (
        <EnvCard key={k} groupKey={k} group={g} />
      ))}
    </div>

    <Card>
      <CardHeader
        title="Secretos compartidos"
        description="Estos valores DEBEN coincidir entre los servicios que los comparten."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[13px]">
        <SecretItem
          severity="critical"
          text={
            <>
              <code className="font-mono text-amber-300">JWT_SECRET</code>,{' '}
              <code className="font-mono text-amber-300">JWT_ISSUER</code>,{' '}
              <code className="font-mono text-amber-300">JWT_AUDIENCE</code> deben ser idénticos en{' '}
              <code className="font-mono">server-auth-aisentinel</code> y{' '}
              <code className="font-mono">server-admin-aisentinel</code>.
            </>
          }
        />
        <SecretItem
          severity="critical"
          text={
            <>
              <code className="font-mono text-amber-300">INTERNAL_API_TOKEN</code> (auth ↔ admin) e{' '}
              <code className="font-mono text-amber-300">INTERNAL_API_KEY</code> (admin ↔ pyimage)
              son dos valores distintos pero ambos deben estar configurados en ambos extremos.
            </>
          }
        />
        <SecretItem
          severity="important"
          text={
            <>
              <code className="font-mono text-amber-300">PYTHON_SERVER_URL</code> en el admin y{' '}
              <code className="font-mono text-amber-300">NODE_ADMIN_URL</code> en pyimage deben
              apuntarse mutuamente de forma correcta.
            </>
          }
        />
        <SecretItem
          severity="info"
          text={
            <>
              <code className="font-mono text-amber-300">corsOptions</code> en cada server define
              los orígenes permitidos; ajustar según el dominio de producción.
            </>
          }
        />
      </div>
    </Card>
  </div>
);

export default EnvConfigSection;
