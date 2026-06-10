import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const Pagination = ({ page, totalPages, onPageChange, className }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  const push = (n) => pages.push(n);
  const window = 1;
  push(1);
  if (page - window > 2) push('…');
  for (let i = Math.max(2, page - window); i <= Math.min(totalPages - 1, page + window); i += 1) {
    push(i);
  }
  if (page + window < totalPages - 1) push('…');
  if (totalPages > 1) push(totalPages);

  return (
    <nav className={cn('flex items-center gap-1', className)} aria-label="Paginación">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="h-9 w-9 inline-flex items-center justify-center rounded-md text-on-surface-variant hover:bg-amber-400/10 hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-on-surface-dim">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              'h-9 min-w-9 px-2.5 inline-flex items-center justify-center rounded-md text-sm font-label transition-colors',
              p === page
                ? 'bg-amber-400 text-amber-900 font-bold shadow-[0_0_18px_rgba(245,197,58,0.35)]'
                : 'text-on-surface-variant hover:bg-amber-400/10 hover:text-amber-300'
            )}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="h-9 w-9 inline-flex items-center justify-center rounded-md text-on-surface-variant hover:bg-amber-400/10 hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Página siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default Pagination;
