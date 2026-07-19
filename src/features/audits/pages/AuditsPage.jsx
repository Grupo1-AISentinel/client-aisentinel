import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  RefreshCw,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
  Pause,
  Play,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import { Input, Select, Button, Skeleton } from '../../../shared/components/ui/index.js';
import EmptyState from '../../../shared/components/feedback/EmptyState.jsx';
import ErrorState from '../../../shared/components/feedback/ErrorState.jsx';
import { auditsApi } from '../../../shared/api/adminApi.js';
import { extractErrorMessage } from '../../../shared/api/errors.js';
import { AUDIT_ACTIONS } from '../../../shared/utils/constants.js';
import LogDetailDrawer from '../components/LogDetailDrawer.jsx';
import toast from 'react-hot-toast';
import { cn } from '../../../shared/utils/cn.js';

const PAGE_SIZE = 50;

const TerminalDots = () => (
  <div className="flex items-center gap-1.5" aria-hidden>
    <span className="w-2.5 h-2.5 rounded-full bg-error/70" />
    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
    <span className="w-2.5 h-2.5 rounded-full bg-success-bright/70" />
  </div>
);

const actionVariant = {
  POST: 'success',
  PUT: 'warning',
  PATCH: 'info',
  DELETE: 'error',
};

const formatMethod = (m) => {
  if (!m) return '—';
  return m.padEnd(6, ' ');
};

const AuditsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [selected, setSelected] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [followTail, setFollowTail] = useState(true);
  const streamRef = useRef(null);

  const fetch = async (pageToLoad = page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await auditsApi.getAll({ page: pageToLoad, limit: PAGE_SIZE });
      setData(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch(page);
  }, [page]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const id = setInterval(() => {
      fetch(1);
      setPage(1);
    }, 10_000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  useEffect(() => {
    if (!followTail || loading) return;
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [data, loading, followTail]);

  const filtered = useMemo(() => {
    if (!search && !action) return data;
    const q = search.toLowerCase();
    return data.filter((row) => {
      if (action && row.action !== action) return false;
      if (!q) return true;
      return (
        row.userId?.toLowerCase().includes(q) ||
        row.endpoint?.toLowerCase().includes(q) ||
        row.userRole?.toLowerCase().includes(q) ||
        row.ipAddress?.toLowerCase().includes(q)
      );
    });
  }, [data, search, action]);

  const handleRefresh = async () => {
    await fetch(1);
    setPage(1);
    toast.success('Bitácora actualizada');
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="BITÁCORA DE AUDITORÍA"
        title="Consola de eventos"
        liveIndicator={autoRefresh}
        description="Stream en vivo de cada cambio importante en el sistema."
        meta={
          <>
            <span>
              <span className="text-amber-300/60">EVENTOS</span>
              <span className="ml-1.5 text-amber-300 font-bold">{filtered.length}</span>
            </span>
            <span className="text-amber-300/40">·</span>
            <span>
              <span className="text-amber-300/60">PÁG</span>
              <span className="ml-1.5 text-amber-300 font-bold">
                {page}/{totalPages}
              </span>
            </span>
          </>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={autoRefresh ? 'primary' : 'outline'}
              leftIcon={autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              onClick={() => setAutoRefresh((v) => !v)}
            >
              {autoRefresh ? 'Streaming' : 'Stream'}
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={handleRefresh}
            >
              Refrescar
            </Button>
          </div>
        }
      />

      {error ? (
        <ErrorState description={error} onRetry={() => fetch(page)} />
      ) : (
        <div className="bg-surface-container-lowest border border-amber-400/15 rounded-xl overflow-hidden shadow-2xl">
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/10 bg-surface-container/60">
            <TerminalDots />
            <span className="font-mono text-[11px] text-amber-300/90 ml-1 select-none">
              ~/aisentinel/audit.log
            </span>
            <span className="font-mono text-[10px] text-on-surface-dim ml-auto flex items-center gap-3">
              <span className="hidden sm:inline">$ tail -f</span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    autoRefresh ? 'bg-success-bright animate-pulse' : 'bg-on-surface-dim'
                  )}
                />
                {autoRefresh ? 'LIVE' : 'IDLE'}
              </span>
            </span>
          </div>

          <div className="px-4 py-3 border-b border-white/5 bg-surface-container/30">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-2.5 items-end">
              <Input
                leftIcon={<Search className="w-4 h-4" />}
                placeholder="grep — usuario, endpoint, IP…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="font-mono"
              />
              <Select
                leftIcon={<Filter className="w-4 h-4" />}
                options={[
                  { value: '', label: '— todas las acciones' },
                  ...AUDIT_ACTIONS.map((a) => ({ value: a, label: a })),
                ]}
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="font-mono"
              />
              <Button
                size="md"
                variant="ghost"
                leftIcon={<X className="w-4 h-4" />}
                onClick={() => {
                  setSearch('');
                  setAction('');
                }}
              >
                Limpiar
              </Button>
            </div>
          </div>

          <div
            ref={streamRef}
            className="relative max-h-[60vh] overflow-y-auto bg-surface-container-lowest/50 scan-bar"
          >
            {loading ? (
              <div className="p-4 space-y-1.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="Sin registros"
                  description="No hay entradas que coincidan con los filtros."
                  compact
                />
              </div>
            ) : (
              <ul className="font-mono text-[12px] divide-y divide-white/5">
                {filtered.map((log, idx) => {
                  const variant = actionVariant[log.action] || 'default';
                  const ts = log.createdAt
                    ? new Date(log.createdAt).toLocaleTimeString('es-GT', { hour12: false })
                    : '—';
                  const isSelected = selected?._id === log._id;
                  return (
                    <li
                      key={log._id || `${log.userId}-${log.createdAt}-${idx}`}
                      className={cn(
                        'grid grid-cols-[88px_70px_1fr_160px] gap-3 items-center px-4 py-1.5 cursor-pointer',
                        'transition-colors duration-150',
                        isSelected ? 'bg-amber-400/15' : 'hover:bg-amber-400/[0.06]'
                      )}
                      onClick={() => setSelected(log)}
                    >
                      <span className="text-amber-300/80 font-mono text-[11px]">{ts}</span>
                      <span>
                        <span
                          className={cn(
                            'inline-flex items-center font-mono text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded border',
                            variant === 'success' &&
                              'text-success-bright border-success/30 bg-success/10',
                            variant === 'warning' &&
                              'text-amber-300 border-amber-400/30 bg-amber-400/10',
                            variant === 'info' && 'text-amber-300 border-amber-400/30 bg-info/10',
                            variant === 'error' && 'text-error-bright border-error/30 bg-error/10',
                            variant === 'default' &&
                              'text-on-surface-variant border-white/10 bg-white/5'
                          )}
                        >
                          {formatMethod(log.action)}
                        </span>
                      </span>
                      <span className="text-on-surface truncate" title={log.endpoint}>
                        {log.endpoint || '—'}
                      </span>
                      <span className="text-on-surface-variant truncate" title={log.userId}>
                        {log.userId || '—'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-surface-container/40">
            <Button
              size="sm"
              variant={followTail ? 'primary' : 'ghost'}
              leftIcon={
                followTail ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )
              }
              onClick={() => {
                setFollowTail((v) => !v);
                if (!followTail && streamRef.current) {
                  requestAnimationFrame(() => {
                    streamRef.current.scrollTop = streamRef.current.scrollHeight;
                  });
                }
              }}
            >
              {followTail ? 'Siguiendo' : 'Pausar tail'}
            </Button>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                ← Anterior
              </Button>
              <span className="font-mono text-xs text-amber-300 px-2">
                {page} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Siguiente →
              </Button>
            </div>
          </div>
        </div>
      )}

      <LogDetailDrawer log={selected} isOpen={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default AuditsPage;
