import { useState } from 'react';
import {
  HashIcon,
  TerminalIcon,
  InfoIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DatabaseIcon,
  CopyIcon,
  CheckIcon,
} from './icons.jsx';
import MethodBadge from './MethodBadge.jsx';
import StatusBadge from './StatusBadge.jsx';
import CodeBlock from './CodeBlock.jsx';
import { cn } from '../../utils/cn.js';

const Row = ({ name, type, required, description }) => (
  <tr className="border-t border-white/5">
    <td className="px-3 py-2 font-mono text-amber-300/90 text-[12.5px] whitespace-nowrap">
      {name}
    </td>
    <td className="px-3 py-2 font-mono text-on-surface-variant text-[12px] whitespace-nowrap">
      {type}
    </td>
    <td className="px-3 py-2">
      {required ? (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30">
          sí
        </span>
      ) : (
        <span className="text-on-surface-dim text-[11px]">no</span>
      )}
    </td>
    <td className="px-3 py-2 text-on-surface text-[13px] leading-relaxed">{description}</td>
  </tr>
);

const ParamTable = ({ params }) => {
  if (!params || params.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-md border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.03] border-b border-white/10">
          <tr>
            <th className="px-3 py-2 text-left font-label text-[10px] uppercase tracking-wider text-on-surface-dim w-[160px]">
              Nombre
            </th>
            <th className="px-3 py-2 text-left font-label text-[10px] uppercase tracking-wider text-on-surface-dim w-[100px]">
              Tipo
            </th>
            <th className="px-3 py-2 text-left font-label text-[10px] uppercase tracking-wider text-on-surface-dim w-[60px]">
              Req.
            </th>
            <th className="px-3 py-2 text-left font-label text-[10px] uppercase tracking-wider text-on-surface-dim">
              Descripción
            </th>
          </tr>
        </thead>
        <tbody>
          {params.map((p, i) => (
            <Row key={i} {...p} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Section = ({ icon: Icon, label, children, defaultOpen = false, badge }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-white/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 py-2.5 px-1 text-left hover:text-amber-300 transition-colors"
      >
        <span className="flex items-center gap-2 text-amber-300/80">
          {Icon && <Icon className="w-3.5 h-3.5" />}
          <span className="font-label text-[11px] uppercase tracking-wider">{label}</span>
          {badge && <span className="font-mono text-[10px] text-on-surface-dim">{badge}</span>}
        </span>
        {open ? (
          <ChevronDownIcon className="w-4 h-4 text-on-surface-dim" />
        ) : (
          <ChevronRightIcon className="w-4 h-4 text-on-surface-dim" />
        )}
      </button>
      {open && <div className="pb-4 px-1">{children}</div>}
    </div>
  );
};

const ResponseRow = ({ code, info }) => (
  <div className="rounded-md border border-white/10 bg-black/20 overflow-hidden">
    <div className="flex items-center gap-3 px-3 py-2 border-b border-white/5">
      <StatusBadge code={Number(code)} />
      <span className="text-[13px] text-on-surface">{info.description}</span>
    </div>
    {info.example && (
      <div className="p-2">
        <CodeBlock code={JSON.stringify(info.example, null, 2)} language="json" />
      </div>
    )}
  </div>
);

const CopyPathButton = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const handle = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };
  return (
    <button
      type="button"
      onClick={handle}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider text-on-surface-dim hover:text-amber-300 hover:bg-white/10 transition-colors"
      aria-label="Copiar ruta"
    >
      {copied ? (
        <CheckIcon className="w-3 h-3 text-emerald-300" />
      ) : (
        <CopyIcon className="w-3 h-3" />
      )}
      {copied ? 'OK' : 'Copiar'}
    </button>
  );
};

const EndpointCard = ({
  method,
  path,
  description,
  auth,
  roles,
  rateLimit,
  tags = [],
  pathParams,
  query,
  body,
  responses,
  example,
  usedBy,
  notes,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const responseCount = responses ? Object.keys(responses).length : 0;
  const paramCount =
    (pathParams?.length || 0) +
    (query?.length || 0) +
    (Array.isArray(body) ? body.length : body ? 1 : 0);
  const isExpandable = paramCount > 0 || responseCount > 0 || example || usedBy?.length || notes;

  const toggle = () => isExpandable && setOpen((v) => !v);

  return (
    <article
      className={cn(
        'rounded-lg border border-white/10 bg-surface-container overflow-hidden transition-colors',
        open ? 'border-amber-400/20' : 'hover:border-amber-400/30'
      )}
    >
      <div
        role="button"
        tabIndex={isExpandable ? 0 : -1}
        onClick={toggle}
        onKeyDown={(e) => {
          if (isExpandable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            toggle();
          }
        }}
        className={cn(
          'w-full flex items-start gap-3 p-4 text-left',
          isExpandable && 'cursor-pointer hover:bg-white/[0.02]'
        )}
      >
        <div className="flex-shrink-0 mt-0.5">
          <MethodBadge method={method} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <code className="font-mono text-[13px] text-on-surface break-all">{path}</code>
            <CopyPathButton value={path} />
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-white/5 text-on-surface-variant border border-white/10"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="text-[13px] text-on-surface-variant leading-relaxed">{description}</p>
          {(auth || roles?.length || rateLimit) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {auth && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-white/5 text-on-surface-variant border border-white/10">
                  {auth}
                </span>
              )}
              {roles && roles.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {roles.join(' · ')}
                </span>
              )}
              {rateLimit && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-sky-500/10 text-sky-300 border border-sky-500/30">
                  {rateLimit}
                </span>
              )}
            </div>
          )}
        </div>
        {isExpandable && (
          <div className="flex-shrink-0 mt-0.5 text-on-surface-dim">
            {open ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </div>
        )}
      </div>

      {open && isExpandable && (
        <div className="px-4 pb-4 space-y-1 border-t border-white/5 pt-2 bg-black/10">
          {pathParams && pathParams.length > 0 && (
            <Section icon={HashIcon} label="Path params" defaultOpen>
              <ParamTable params={pathParams} />
            </Section>
          )}
          {query && query.length > 0 && (
            <Section icon={DatabaseIcon} label="Query params" defaultOpen>
              <ParamTable params={query} />
            </Section>
          )}
          {body && (
            <Section icon={DatabaseIcon} label="Body" defaultOpen>
              {typeof body === 'string' ? (
                <CodeBlock code={body} language="json" />
              ) : (
                <ParamTable params={body} />
              )}
            </Section>
          )}
          {responses && (
            <Section icon={CheckIcon} label="Respuestas" defaultOpen badge={`${responseCount}`}>
              <div className="space-y-2">
                {Object.entries(responses)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([code, info]) => (
                    <ResponseRow key={code} code={code} info={info} />
                  ))}
              </div>
            </Section>
          )}
          {example && (
            <Section icon={TerminalIcon} label="Ejemplo curl" defaultOpen>
              <CodeBlock code={example} language="bash" title="curl" />
            </Section>
          )}
          {usedBy && usedBy.length > 0 && (
            <Section icon={InfoIcon} label="Usado por" badge={`${usedBy.length}`}>
              <ul className="space-y-1 text-[12.5px]">
                {usedBy.map((u, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-300/70 mt-0.5">›</span>
                    <code className="font-mono text-on-surface-variant bg-white/5 px-1.5 py-0.5 rounded text-[11.5px]">
                      {u}
                    </code>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {notes && (
            <Section icon={InfoIcon} label="Notas">
              <div className="flex gap-2 p-3 rounded-md bg-amber-400/5 border border-amber-400/20">
                <InfoIcon className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <p className="text-[13px] text-on-surface-variant leading-relaxed">{notes}</p>
              </div>
            </Section>
          )}
        </div>
      )}
    </article>
  );
};

export default EndpointCard;
