import { Drawer, Badge } from '../../../shared/components/ui/index.js';
import { formatDateTime } from '../../../shared/utils/formatters.js';

const MetaRow = ({ label, value, mono = true }) => (
  <div className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-b-0">
    <span className="text-on-surface-dim text-[10px] font-label uppercase tracking-wider w-24 shrink-0 pt-0.5">
      {label}
    </span>
    <span className={`text-on-surface text-xs ${mono ? 'font-mono' : ''} break-all`}>
      {value ?? '—'}
    </span>
  </div>
);

const actionVariant = {
  POST: 'success',
  PUT: 'warning',
  PATCH: 'info',
  DELETE: 'error',
};

const LogDetailDrawer = ({ log, isOpen, onClose }) => {
  if (!log) return null;
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Detalle del log" size="lg">
      <div className="flex flex-col gap-4 font-mono text-xs">
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant={actionVariant[log.action] || 'default'} size="sm">
            {log.action}
          </Badge>
          <span className="text-on-surface text-sm">{log.endpoint}</span>
        </div>

        <section className="bg-surface-container-lowest border border-white/5 rounded-md p-3">
          <MetaRow label="Timestamp" value={formatDateTime(log.createdAt)} />
          <MetaRow label="Usuario" value={log.userId} />
          <MetaRow label="Rol" value={log.userRole} />
          <MetaRow label="IP" value={log.ipAddress} />
        </section>

        <section>
          <p className="text-on-surface-dim text-[10px] font-label uppercase tracking-wider mb-2">
            Detalles
          </p>
          <pre className="bg-surface-container-lowest border border-white/5 rounded-md p-3 overflow-x-auto text-on-surface whitespace-pre-wrap break-words">
            {JSON.stringify(log.details ?? {}, null, 2)}
          </pre>
        </section>
      </div>
    </Drawer>
  );
};

export default LogDetailDrawer;
