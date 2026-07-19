import { useMemo, useState } from 'react';
import {
  EndpointCard,
  SearchIcon,
  FilterIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  HashIcon,
} from '../../../../shared/components/docs/index.js';
import Card from '../../../../shared/components/ui/Card.jsx';
import Badge from '../../../../shared/components/ui/Badge.jsx';
import { cn } from '../../../../shared/utils/cn.js';

const METHOD_COLOR = {
  GET: 'sky',
  POST: 'emerald',
  PUT: 'amber',
  PATCH: 'violet',
  DELETE: 'rose',
};

const COLOR_BG = {
  sky: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  violet: 'bg-violet-500/15 text-violet-300 border-violet-400/30',
  rose: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
};

const MethodChip = ({ method, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors whitespace-nowrap border',
      active
        ? method === 'ALL'
          ? 'bg-amber-400 text-amber-900 border-amber-300'
          : COLOR_BG[METHOD_COLOR[method]]
        : 'text-on-surface-dim border-white/10 hover:text-on-surface hover:bg-white/5'
    )}
  >
    {method}
  </button>
);

const Stats = ({ endpoints }) => {
  const counts = useMemo(() => {
    const c = { GET: 0, POST: 0, PUT: 0, PATCH: 0, DELETE: 0 };
    endpoints.forEach((e) => {
      if (c[e.method] !== undefined) c[e.method] += 1;
    });
    return c;
  }, [endpoints]);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {Object.entries(counts).map(([m, n]) => (
        <div
          key={m}
          className="rounded-md border border-white/10 bg-white/[0.02] p-2.5 flex items-center justify-between"
        >
          <span
            className={cn(
              'font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border',
              COLOR_BG[METHOD_COLOR[m]]
            )}
          >
            {m}
          </span>
          <span className="font-display text-lg font-bold text-on-surface">{n}</span>
        </div>
      ))}
    </div>
  );
};

const GroupBlock = ({ group, defaultOpen, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md border border-white/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center justify-between gap-3 p-3 text-left transition-colors',
          open ? 'bg-amber-400/5' : 'bg-white/[0.02] hover:bg-white/[0.04]'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              'shrink-0 w-7 h-7 rounded-md border flex items-center justify-center',
              open
                ? 'bg-amber-400 text-amber-900 border-amber-300'
                : 'bg-white/5 text-amber-300 border-amber-400/30'
            )}
          >
            <HashIcon className="w-3.5 h-3.5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-sm font-bold text-on-surface">{group.title}</h3>
            <p className="text-[11.5px] text-on-surface-dim">{group.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge size="sm" variant={open ? 'brand' : 'default'}>
            {group.endpoints.length}
          </Badge>
          {open ? (
            <ChevronDownIcon className="w-4 h-4 text-on-surface-dim" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-on-surface-dim" />
          )}
        </div>
      </button>
      {open && (
        <div className="p-2.5 space-y-2.5 border-t border-white/5 bg-black/10">{children}</div>
      )}
    </div>
  );
};

const ApiSection = ({ title, basePath, service, orm, description, endpoints, groups, groupFn }) => {
  const [filter, setFilter] = useState('');
  const [method, setMethod] = useState('ALL');
  const [openGroups, setOpenGroups] = useState(new Set(groups.map((g) => g.id)));

  const filtered = useMemo(() => {
    let result = endpoints;
    if (method !== 'ALL') result = result.filter((e) => e.method === method);
    if (filter) {
      const q = filter.toLowerCase();
      result = result.filter(
        (e) =>
          e.path.toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q) ||
          (e.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [endpoints, filter, method]);

  const grouped = useMemo(() => groupFn(filtered), [filtered, groupFn]);
  const visible = grouped.reduce((acc, g) => acc + g.endpoints.length, 0);

  const toggleGroup = (id) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-start gap-3 flex-wrap mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-extrabold text-on-surface tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[12px]">
          <div className="p-2.5 rounded-md bg-white/[0.03] border border-white/5">
            <p className="text-[10px] text-on-surface-dim font-label uppercase tracking-wider">
              Base path
            </p>
            <code className="font-mono text-amber-300 text-[12px]">{basePath}</code>
          </div>
          <div className="p-2.5 rounded-md bg-white/[0.03] border border-white/5">
            <p className="text-[10px] text-on-surface-dim font-label uppercase tracking-wider">
              Servicio
            </p>
            <code className="font-mono text-amber-300 text-[12px] break-all">{service}</code>
          </div>
          <div className="p-2.5 rounded-md bg-white/[0.03] border border-white/5">
            <p className="text-[10px] text-on-surface-dim font-label uppercase tracking-wider">
              ORM
            </p>
            <code className="font-mono text-amber-300 text-[12px]">{orm}</code>
          </div>
        </div>
      </Card>

      <Stats endpoints={endpoints} />

      <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-2">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-dim pointer-events-none" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar por ruta, descripción o tag..."
            className="w-full pl-9 pr-3 py-2 rounded-md bg-white/[0.04] border border-white/10 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 text-[13px] text-on-surface placeholder:text-on-surface-dim"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-md bg-white/[0.03] border border-white/5 overflow-x-auto">
          {['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
            <MethodChip key={m} method={m} active={method === m} onClick={() => setMethod(m)} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11.5px] text-on-surface-variant">
        <span>
          {visible} {visible === 1 ? 'endpoint' : 'endpoints'} visibles
          {visible !== endpoints.length && ` de ${endpoints.length}`}
        </span>
        {(filter || method !== 'ALL') && (
          <button
            type="button"
            onClick={() => {
              setFilter('');
              setMethod('ALL');
            }}
            className="inline-flex items-center gap-1 text-amber-300 hover:underline"
          >
            <FilterIcon className="w-3 h-3" />
            Limpiar filtros
          </button>
        )}
      </div>

      {visible === 0 ? (
        <Card>
          <div className="text-center py-8">
            <SearchIcon className="w-7 h-7 text-on-surface-dim mx-auto mb-2" />
            <p className="text-on-surface-variant text-sm">
              Sin endpoints que coincidan con{' '}
              <code className="font-mono text-amber-300">"{filter}"</code>
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {grouped.map((g) => (
            <GroupBlock key={g.id} group={g} defaultOpen={openGroups.has(g.id)}>
              {g.endpoints.map((ep, i) => (
                <EndpointCard key={i} {...ep} />
              ))}
              {g.endpoints.length === 0 && (
                <p className="text-[12px] text-on-surface-dim italic px-1">
                  Sin endpoints en este grupo con los filtros actuales.
                </p>
              )}
              <button
                type="button"
                onClick={() => toggleGroup(g.id)}
                className="text-[11px] text-on-surface-dim hover:text-amber-300"
              >
                {openGroups.has(g.id) ? 'Contraer' : 'Expandir'}
              </button>
            </GroupBlock>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiSection;
