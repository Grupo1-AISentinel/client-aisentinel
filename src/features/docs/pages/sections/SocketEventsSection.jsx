import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightLeftIcon,
  CodeBlock,
  InfoIcon,
  CheckIcon,
} from '../../../../shared/components/docs/index.js';
import Card, { CardHeader } from '../../../../shared/components/ui/Card.jsx';
import Badge from '../../../../shared/components/ui/Badge.jsx';
import { socketEvents, socketRooms, socketAuthModes } from '../../data/socketEvents.js';
import { cn } from '../../../../shared/utils/cn.js';

const directionMeta = {
  'cliente → servidor': { icon: ArrowUpIcon, variant: 'info' },
  'servidor → cliente': { icon: ArrowDownIcon, variant: 'success' },
  'pyimage → servidor': { icon: ArrowRightLeftIcon, variant: 'warning' },
};

const EventCard = ({ event, open, onToggle }) => {
  const meta = directionMeta[event.direction] || directionMeta['cliente → servidor'];
  const Icon = meta.icon;
  return (
    <Card>
      <button type="button" onClick={onToggle} className="w-full flex items-start gap-3 text-left">
        <span
          className={cn(
            'shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md border',
            meta.variant === 'info' && 'bg-sky-500/10 text-sky-300 border-sky-500/30',
            meta.variant === 'success' &&
              'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
            meta.variant === 'warning' && 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          )}
        >
          <Icon className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="font-mono text-amber-300 text-[14px] font-semibold">{event.name}</code>
            <Badge size="sm" variant={meta.variant}>
              {event.direction}
            </Badge>
          </div>
          <p className="text-[13px] text-on-surface-variant mt-1 leading-relaxed">
            {event.description}
          </p>
        </div>
        <div className="shrink-0 mt-1.5 text-on-surface-dim">
          {open ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </div>
      </button>

      {open && (
        <div className="mt-4 pl-12 space-y-3 border-t border-white/5 pt-3">
          {event.example && (
            <div>
              <p className="font-label text-[10px] uppercase tracking-wider text-amber-300/80 mb-1.5">
                Ejemplo de payload
              </p>
              <CodeBlock code={JSON.stringify(event.example, null, 2)} language="json" />
            </div>
          )}
          {event.usedBy && event.usedBy.length > 0 && (
            <div>
              <p className="font-label text-[10px] uppercase tracking-wider text-amber-300/80 mb-1.5">
                Usado por
              </p>
              <ul className="space-y-1 text-[12.5px]">
                {event.usedBy.map((u, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-300/70 mt-0.5">›</span>
                    <code className="font-mono text-on-surface-variant bg-white/5 px-1.5 py-0.5 rounded text-[11.5px]">
                      {u}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {event.notes && (
            <div className="flex gap-2 p-3 rounded-md bg-amber-400/5 border border-amber-400/20">
              <InfoIcon className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-on-surface-variant leading-relaxed">{event.notes}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

const SocketEventsSection = () => {
  const [openId, setOpenId] = useState(socketEvents[0]?.name);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Eventos Socket.IO"
          description="Servidor: server-admin-aisentinel · Namespace: / · Puerto: 3067"
        />
        <p className="text-sm text-on-surface-variant leading-relaxed">
          El Admin expone un servidor Socket.IO. La autenticación se valida en{' '}
          <code className="font-mono text-amber-300">io.use()</code> y diferencia entre conexiones
          de usuario (JWT) y de servicio (x-internal-api-key).
        </p>
      </Card>

      <Card>
        <CardHeader title="Rooms disponibles" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {socketRooms.map((r) => (
            <div key={r.name} className="rounded-md border border-white/10 bg-black/30 p-3">
              <code className="font-mono text-amber-300 text-[12.5px]">{r.name}</code>
              <p className="text-[12.5px] text-on-surface-variant mt-1.5 leading-relaxed">
                {r.description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Modos de autenticación" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {socketAuthModes.map((m) => (
            <div key={m.name} className="rounded-md border border-white/10 bg-black/30 p-3">
              <Badge variant="warning" size="sm">
                {m.name}
              </Badge>
              <p className="text-[12.5px] text-on-surface-variant mt-2">
                <strong className="text-on-surface">Mecanismo:</strong> {m.mechanism}
              </p>
              <p className="text-[12.5px] text-on-surface-variant mt-1">
                <strong className="text-on-surface">Verificación:</strong> {m.verify}
              </p>
              <p className="text-[12.5px] text-on-surface-variant mt-1">
                <strong className="text-on-surface">Datos en socket:</strong>{' '}
                <code className="font-mono text-amber-300/90 text-[11.5px]">{m.data}</code>
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="text-base font-display font-bold text-on-surface mb-3">
          Catálogo de eventos
        </h2>
        <div className="space-y-2.5">
          {socketEvents.map((ev) => (
            <EventCard
              key={ev.name}
              event={ev}
              open={openId === ev.name}
              onToggle={() => setOpenId(openId === ev.name ? null : ev.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocketEventsSection;
