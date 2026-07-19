import { useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  NetworkIcon,
  ListIcon,
} from '../../../../shared/components/docs/index.js';
import Card, { CardHeader } from '../../../../shared/components/ui/Card.jsx';
import Badge from '../../../../shared/components/ui/Badge.jsx';
import { FlowDiagram, stepLabel } from '../../../../shared/components/docs/index.js';
import { flows } from '../../data/flows.js';
import { cn } from '../../../../shared/utils/cn.js';

const TYPE_BADGE = {
  http: { variant: 'warning' },
  socket: { variant: 'info' },
  db: { variant: 'success' },
  auth: { variant: 'secondary' },
  file: { variant: 'error' },
};

const FlowCard = ({ flow, active, onClick, index }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'w-full text-left rounded-md border p-3 flex items-center gap-3 transition-all',
      active
        ? 'border-amber-400/50 bg-amber-400/10'
        : 'border-white/10 bg-white/[0.02] hover:border-amber-400/30'
    )}
  >
    <span
      className={cn(
        'shrink-0 w-7 h-7 rounded-md font-mono text-[11px] font-bold flex items-center justify-center border',
        active
          ? 'bg-amber-400 text-amber-900 border-amber-300'
          : 'bg-white/5 text-on-surface-dim border-white/10'
      )}
    >
      {String(index + 1).padStart(2, '0')}
    </span>
    <p className="text-[13px] font-semibold text-on-surface leading-tight">
      {flow.title.replace(/^\d+\.\s*/, '')}
    </p>
  </button>
);

const FlowExamplesSection = () => {
  const [active, setActive] = useState(0);
  const [view, setView] = useState('diagram');
  const flow = flows[active];

  const go = (delta) => {
    setActive((i) => (i + delta + flows.length) % flows.length);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Flujos end-to-end"
          description="Diagramas de secuencia de los casos de uso principales."
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-5">
        <aside>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-label text-[10px] uppercase tracking-wider text-amber-300/80 flex items-center gap-1.5">
              <ListIcon className="w-3 h-3" />
              {flows.length} flujos
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => go(-1)}
                className="p-1 rounded text-on-surface-dim hover:text-amber-300 hover:bg-white/10"
                aria-label="Anterior"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="p-1 rounded text-on-surface-dim hover:text-amber-300 hover:bg-white/10"
                aria-label="Siguiente"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {flows.map((f, i) => (
              <FlowCard
                key={f.id}
                flow={f}
                index={i}
                active={i === active}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </aside>

        <div className="min-w-0 space-y-3">
          <Card>
            <div className="flex items-start gap-3 flex-wrap mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-base font-display font-bold text-on-surface">{flow.title}</h2>
                  <Badge size="sm" variant="default">
                    {flow.steps.length} pasos
                  </Badge>
                </div>
                <p className="text-[13px] text-on-surface-variant leading-relaxed">
                  {flow.summary}
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-md bg-white/[0.03] border border-white/5">
                <button
                  type="button"
                  onClick={() => setView('diagram')}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] transition-colors',
                    view === 'diagram'
                      ? 'bg-amber-400 text-amber-900 font-bold'
                      : 'text-on-surface-variant hover:text-amber-300'
                  )}
                >
                  <NetworkIcon className="w-3.5 h-3.5" />
                  Diagrama
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] transition-colors',
                    view === 'list'
                      ? 'bg-amber-400 text-amber-900 font-bold'
                      : 'text-on-surface-variant hover:text-amber-300'
                  )}
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  Pasos
                </button>
              </div>
            </div>
            {view === 'diagram' ? (
              <FlowDiagram steps={flow.steps} />
            ) : (
              <ol className="space-y-2">
                {flow.steps.map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-2.5 rounded-md border border-white/10 bg-white/[0.02]"
                  >
                    <span className="shrink-0 w-7 h-7 rounded-md font-mono text-[11px] font-bold flex items-center justify-center bg-amber-400/15 text-amber-300 border border-amber-400/30">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge size="sm" variant={TYPE_BADGE[step.type]?.variant || 'default'}>
                          {stepLabel[step.type] || step.type}
                        </Badge>
                        <span className="font-mono text-[10px] text-on-surface-dim">
                          {step.from} → {step.to}
                        </span>
                      </div>
                      <p className="text-[12px] text-on-surface mt-1 font-mono">{step.label}</p>
                      {step.detail && (
                        <p className="text-[11px] text-on-surface-dim mt-0.5">{step.detail}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FlowExamplesSection;
