import { cn } from '../../utils/cn.js';

const variants = {
  default: 'bg-surface-container-high text-on-surface-variant border border-white/10',
  success: 'bg-success/10 text-success-bright border border-success/20',
  error: 'bg-error/10 text-error-bright border border-error/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  info: 'bg-info/10 text-info border border-info/20',
  secondary: 'bg-amber-400/10 text-amber-300 border border-amber-400/25',
  brand: 'bg-amber-400 text-amber-900 border border-amber-300/70 font-bold',
};

const sizes = {
  sm: 'text-[10px] h-5 px-2',
  md: 'text-xs h-6 px-2.5',
  lg: 'text-sm h-7 px-3',
};

const Badge = ({ variant = 'default', size = 'md', leftIcon, rightIcon, className, children }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-label whitespace-nowrap',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </span>
  );
};

export default Badge;
