import { cn } from '../../utils/cn.js';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const toneClasses = {
  warning: {
    chip: 'bg-error/10 text-error border border-error/20',
    icon: 'bg-error/10 text-error',
    value: 'text-on-surface',
    glow: '',
  },
  success: {
    chip: 'bg-success/10 text-success-bright border border-success/20',
    icon: 'bg-success/10 text-success-bright',
    value: 'text-on-surface',
    glow: '',
  },
  info: {
    chip: 'bg-amber-400/10 text-amber-300 border border-amber-400/20',
    icon: 'bg-amber-400/15 text-amber-300',
    value: 'text-amber-300',
    glow: 'inner-glow-warning',
  },
  error: {
    chip: 'bg-error/10 text-error border border-error/20',
    icon: 'bg-error/20 text-error animate-pulse',
    value: 'text-error-bright',
    glow: 'inner-glow-critical',
  },
  neutral: {
    chip: 'bg-white/5 text-on-surface-variant border border-white/10',
    icon: 'bg-white/5 text-on-surface-variant',
    value: 'text-on-surface',
    glow: '',
  },
};

const TrendIcon = ({ direction }) => {
  if (direction === 'up') return <TrendingUp className="w-3 h-3" />;
  if (direction === 'down') return <TrendingDown className="w-3 h-3" />;
  return <Minus className="w-3 h-3" />;
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  tone = 'info',
  glow = false,
  className,
  loading = false,
}) => {
  const tone_ = toneClasses[tone] || toneClasses.neutral;
  return (
    <div
      className={cn(
        'glass-panel rounded-xl p-5 relative overflow-hidden flex flex-col gap-3',
        'border border-white/10 hover:border-amber-400/30 transition-colors duration-200',
        glow && tone_.glow,
        tone === 'error' && 'border-error/30',
        className
      )}
    >
      <div
        className={cn(
          'absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-50',
          tone === 'error' && 'bg-error/20',
          tone === 'info' && 'bg-amber-400/10',
          tone === 'success' && 'bg-success/10',
          tone === 'warning' && 'bg-error/10',
          tone === 'neutral' && 'bg-white/5'
        )}
      />
      <div className="flex items-start justify-between relative z-10">
        <div className={cn('p-2 rounded-lg', tone_.icon)}>
          {Icon ? <Icon className="w-5 h-5" /> : null}
        </div>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 font-label text-[10px] px-2 py-1 rounded-full',
              tone_.chip
            )}
          >
            <TrendIcon direction={trend} />
            {trendLabel}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <p className="font-label text-[10px] text-on-surface-variant mb-1.5 tracking-wider">
          {label}
        </p>
        <p className={cn('text-3xl font-display font-bold leading-none font-mono', tone_.value)}>
          {loading ? '—' : value}
        </p>
      </div>
    </div>
  );
};

export default MetricCard;
