import { cn } from '../../utils/cn.js';

const methodStyles = {
  GET: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  POST: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  PUT: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  PATCH: 'bg-violet-500/15 text-violet-300 border-violet-400/30',
  DELETE: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
};

const MethodBadge = ({ method = 'GET', className }) => (
  <span
    className={cn(
      'inline-flex items-center justify-center rounded font-mono font-bold text-[10px] tracking-wider uppercase h-5 min-w-[50px] px-1.5 border shrink-0',
      methodStyles[method] || methodStyles.GET,
      className
    )}
  >
    {method}
  </span>
);

export default MethodBadge;
