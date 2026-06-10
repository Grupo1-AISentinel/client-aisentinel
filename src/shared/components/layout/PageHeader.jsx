import { cn } from '../../utils/cn.js';

const PageHeader = ({
  title,
  description,
  action,
  subtitle,
  className,
  eyebrow,
  withBrand = false,
  liveIndicator = false,
  meta = null,
  badge = null,
}) => (
  <header
    className={cn(
      'relative pl-5 sm:pl-6 pr-2 pt-2 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-5 overflow-hidden',
      className
    )}
  >
    <span
      className="absolute left-0 top-3 bottom-5 w-1 bg-gradient-to-b from-amber-400 via-amber-400/60 to-transparent rounded-r-full shadow-[0_0_10px_rgba(245,197,58,0.5)]"
      aria-hidden
    />
    <span
      className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-amber-400/40 via-amber-400/10 to-transparent"
      aria-hidden
    />

    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-3 flex-wrap mb-2">
        {eyebrow && (
          <span className="font-mono text-[10px] tracking-[0.22em] text-amber-300/90 inline-flex items-center gap-2">
            <span className="inline-block w-5 h-px bg-amber-300/60" aria-hidden />
            {eyebrow}
          </span>
        )}
        {badge}
        {liveIndicator && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/15 text-success-bright border border-success/30 font-label text-[10px]">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-success-bright animate-ping opacity-75" />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-success-bright" />
            </span>
            EN VIVO
          </span>
        )}
      </div>

      <h1
        className={cn(
          'font-display text-[clamp(1.75rem,2.6vw,2.5rem)] font-extrabold text-on-surface tracking-[-0.03em] leading-[1.05]'
        )}
      >
        {withBrand ? <span className="wordmark-gradient">{title}</span> : title}
      </h1>

      {(description || subtitle) && (
        <p className="text-sm text-on-surface-variant mt-2 max-w-2xl leading-relaxed">
          {description || subtitle}
        </p>
      )}

      {meta && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 font-mono text-[11px] text-amber-300/80">
          {meta}
        </div>
      )}
    </div>

    {action && <div className="flex-shrink-0 flex items-center gap-2 flex-wrap">{action}</div>}
  </header>
);

export default PageHeader;
