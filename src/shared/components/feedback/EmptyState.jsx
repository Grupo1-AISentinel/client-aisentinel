import { Inbox } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  compact = false,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center gap-2',
      compact ? 'p-6' : 'p-10',
      'border border-dashed border-amber-400/20 rounded-lg bg-amber-400/[0.02]',
      className
    )}
  >
    <div
      className={cn(
        'rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center',
        compact ? 'w-9 h-9' : 'w-12 h-12'
      )}
    >
      <Icon className={cn('text-amber-300', compact ? 'w-4 h-4' : 'w-6 h-6')} />
    </div>
    {title && <h3 className="text-sm font-display font-semibold text-on-surface">{title}</h3>}
    {description && <p className="text-xs text-on-surface-variant max-w-md">{description}</p>}
    {action && <div className="mt-1">{action}</div>}
  </div>
);

export default EmptyState;
