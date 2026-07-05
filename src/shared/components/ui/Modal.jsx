import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import Button from './Button.jsx';

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const Modal = ({ isOpen, onClose, title, description, size = 'md', children, footer }) => {
  const dialogRef = useRef(null);

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

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        className={cn(
          'modal-panel w-full rounded-2xl animate-slide-up flex flex-col max-h-[90vh] overflow-hidden',
          sizeMap[size]
        )}
      >
        <header
          className="flex items-start justify-between gap-4 p-5 border-b shrink-0"
          style={{ borderColor: 'var(--color-modal-header-border)' }}
        >
          <div>
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-display font-semibold text-on-surface tracking-tight"
              >
                {title}
              </h2>
            )}
            {description && <p className="text-sm text-on-surface-variant mt-1">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-on-surface-variant hover:text-amber-300 hover:bg-white/10 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <footer
            className="flex items-center justify-end gap-2 p-5 border-t shrink-0"
            style={{ borderColor: 'var(--color-table-divider)' }}
          >
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
};

export const ModalFooter = ({
  onCancel,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading,
}) => (
  <>
    <Button variant="ghost" onClick={onCancel} disabled={loading}>
      {cancelText}
    </Button>
    <Button variant="primary" onClick={onConfirm} loading={loading}>
      {confirmText}
    </Button>
  </>
);

export default Modal;
