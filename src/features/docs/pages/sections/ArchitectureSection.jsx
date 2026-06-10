import {
  ServerIcon,
  ShieldIcon,
  BrainIcon,
  DatabaseIcon,
  CameraIcon,
  CpuIcon,
  ActivityIcon,
} from '../../../../shared/components/docs/index.js';
import Card, { CardHeader } from '../../../../shared/components/ui/Card.jsx';
import MetricCard from '../../../../shared/components/ui/MetricCard.jsx';
import { ArchDiagram } from '../../../../shared/components/docs/index.js';

const services = [
  {
    icon: ShieldIcon,
    name: 'Auth Service',
    port: '3069',
    stack: 'Node 20 · Express 5 · Sequelize',
    db: 'PostgreSQL (5436)',
    description: 'Autenticación, usuarios, 2FA, JWT issuance y verificación, API interna.',
  },
  {
    icon: ServerIcon,
    name: 'Admin Service',
    port: '3067',
    stack: 'Node 20 · Express 5 · Mongoose',
    db: 'MongoDB · Cloudinary',
    description: 'CRUD principal, proxy a pyimage, Socket.IO, scheduler de reportes, alertas.',
  },
  {
    icon: BrainIcon,
    name: 'Pyimage Service',
    port: '8000',
    stack: 'Python 3.11 · FastAPI · YOLO26',
    db: 'ChromaDB · InsightFace',
    description: 'Detección y reconocimiento facial, validación de uniformes, embeddings.',
  },
];

const ArchitectureSection = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader
        title="Visión general"
        description="Plataforma distribuida en tres servicios backend y un cliente React."
      />
      <p className="text-sm text-on-surface-variant leading-relaxed">
        El cliente consume la API REST del Admin Service y se conecta vía Socket.IO para recibir
        eventos en tiempo real. El Admin Service es el único que habla con Pyimage (HTTP proxy) y
        con el Auth Service (verificación de JWT). El Auth mantiene la base de usuarios en
        PostgreSQL; el Admin usa MongoDB para todo el dominio y Pyimage persiste embeddings en
        ChromaDB.
      </p>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {services.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.name}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-md bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-base font-bold text-on-surface">{s.name}</h3>
                <p className="font-mono text-[10.5px] text-amber-300/80 mt-0.5">{s.stack}</p>
              </div>
            </div>
            <dl className="space-y-1.5 text-[12.5px]">
              <div className="flex justify-between gap-2">
                <dt className="text-on-surface-dim">Puerto</dt>
                <dd className="font-mono text-on-surface">{s.port}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-on-surface-dim">Base path</dt>
                <dd className="font-mono text-on-surface truncate">{s.db ? '/' : '—'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-on-surface-dim">Persistencia</dt>
                <dd className="font-mono text-on-surface text-right">{s.db}</dd>
              </div>
            </dl>
            <p className="text-[12.5px] text-on-surface-variant mt-3 leading-relaxed">
              {s.description}
            </p>
          </Card>
        );
      })}
    </div>

    <Card>
      <CardHeader
        title="Diagrama de servicios"
        description="Pasa el cursor sobre un nodo para resaltar sus conexiones."
      />
      <ArchDiagram />
    </Card>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricCard
        icon={ActivityIcon}
        label="Servicios backend"
        value="3"
        hint="Auth · Admin · Pyimage"
      />
      <MetricCard
        icon={CameraIcon}
        label="Fuentes de cámara"
        value="4"
        hint="webcam · video · ip · wifi"
      />
      <MetricCard icon={CpuIcon} label="Modelos IA" value="3" hint="YOLO26 · ResNet18 · DINOv2" />
      <MetricCard
        icon={DatabaseIcon}
        label="Bases de datos"
        value="3"
        hint="MongoDB · PostgreSQL · ChromaDB"
      />
    </div>

    <Card>
      <CardHeader
        title="Convenciones y naming"
        description="Patrones consistentes en el código y los datos."
      />
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[13px]">
        <li className="flex items-start gap-2 p-2.5 rounded-md border border-white/5 bg-white/[0.02]">
          <span className="font-mono text-[10.5px] text-amber-300/80 shrink-0 mt-0.5">enum</span>
          <span className="text-on-surface-variant">
            Grados:{' '}
            <code className="font-mono text-amber-300">1RO | 2DO | 3RO | 4TO | 5TO | 6TO</code>
          </span>
        </li>
        <li className="flex items-start gap-2 p-2.5 rounded-md border border-white/5 bg-white/[0.02]">
          <span className="font-mono text-[10.5px] text-amber-300/80 shrink-0 mt-0.5">enum</span>
          <span className="text-on-surface-variant">
            Uniformes: <code className="font-mono text-amber-300">JACKET | TSHIRT | PANTS</code>
          </span>
        </li>
        <li className="flex items-start gap-2 p-2.5 rounded-md border border-white/5 bg-white/[0.02]">
          <span className="font-mono text-[10.5px] text-rose-300/80 shrink-0 mt-0.5">enum</span>
          <span className="text-on-surface-variant">
            Motivos de alerta:{' '}
            <code className="font-mono text-amber-300">
              UNIFORME_INCOMPLETO | ACCESORIO_NO_PERMITIDO | PERSONA_DESCONOCIDA
            </code>
          </span>
        </li>
        <li className="flex items-start gap-2 p-2.5 rounded-md border border-white/5 bg-white/[0.02]">
          <span className="font-mono text-[10.5px] text-emerald-300/80 shrink-0 mt-0.5">rol</span>
          <span className="text-on-surface-variant">
            Roles con sufijo <code className="font-mono text-amber-300">_ROLE</code>:{' '}
            <code className="font-mono text-amber-300">ADMIN_ROLE | COORDINATOR_ROLE</code>
          </span>
        </li>
      </ul>
    </Card>
  </div>
);

export default ArchitectureSection;
