import { cn } from '../../utils/cn.js';

const styleMap = {
  '2xx': 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  '4xx': 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  '5xx': 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  default: 'bg-white/5 text-on-surface-dim border-white/10',
};

const StatusBadge = ({ code, className }) => {
  const family = `${Math.floor(Number(code) / 100)}xx`;
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded font-mono font-bold text-[10px] h-5 min-w-[40px] px-1.5 border',
        styleMap[family] || styleMap.default,
        className
      )}
    >
      {code}
    </span>
  );
};

export default StatusBadge;
