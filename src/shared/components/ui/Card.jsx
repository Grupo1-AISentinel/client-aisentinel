import { cn } from '../../utils/cn.js';

const severityBands = {
  default: 'before:bg-outline-soft',
  success: 'before:bg-success-bright',
  warning: 'before:bg-amber-400',
  error: 'before:bg-error',
  info: 'before:bg-info',
};

const Card = ({ children, className, severity, glass = false, padded = true, glow = false }) => {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-white/10 overflow-hidden',
        'transition-colors duration-200',
        'hover:border-amber-400/20',
        glass ? 'glass-panel' : 'bg-surface-container',
        padded && 'p-5',
        severity && 'before:absolute before:inset-y-0 before:left-0 before:w-1',
        severityBands[severity],
        glow === 'critical' && 'inner-glow-critical border-error/30',
        glow === 'warning' && 'inner-glow-warning',
        glow === 'success' && 'inner-glow-success',
        className
      )}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ title, description, action, className }) => (
  <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
    <div>
      {title && (
        <h3 className="text-base font-display font-semibold text-on-surface tracking-tight">
          {title}
        </h3>
      )}
      {description && <p className="text-sm text-on-surface-variant mt-1">{description}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export { CardHeader };
export default Card;
