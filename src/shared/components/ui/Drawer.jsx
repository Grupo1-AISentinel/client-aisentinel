import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const Drawer = ({ isOpen, onClose, title, size = 'md', children, side = 'right' }) => {
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sideClasses =
    side === 'left' ? 'left-0 border-r border-white/10' : 'right-0 border-l border-white/10';

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-50 flex animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="flex-1" aria-hidden onClick={onClose} />
      <div
        ref={drawerRef}
        className={cn(
          'modal-panel h-full w-full flex flex-col',
          'animate-slide-right',
          sizeMap[size],
          sideClasses
        )}
        style={{ animation: 'slideRight 0.25s ease-out' }}
      >
        <header
          className="flex items-center justify-between gap-4 p-5 border-b shrink-0"
          style={{ borderColor: 'var(--color-modal-header-border)' }}
        >
          <h2
            id="drawer-title"
            className="text-lg font-display font-semibold text-on-surface truncate"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Drawer;
