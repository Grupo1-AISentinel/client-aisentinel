import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { User, LogOut, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../../features/auth/stores/authStore.js';
import { useThemeStore } from '../../../features/preferences/stores/themeStore.js';
import { ROLE_LABELS } from '../../../shared/utils/constants.js';
import { cn } from '../../../shared/utils/cn.js';

const UserDropdown = ({ open, onClose }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const clearAuth = useAuthStore((s) => s.logout);
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        const trigger = document.querySelector('[data-user-trigger]');
        if (trigger && trigger.contains(e.target)) return;
        onClose?.();
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open, onClose]);

  if (!open) return null;

  const fullName = `${user?.name || ''} ${user?.surname || ''}`.trim() || 'Usuario';
  const initials =
    `${(user?.name?.[0] || '').toUpperCase()}${(user?.surname?.[0] || '').toUpperCase()}` || 'U';
  const roleLabel = ROLE_LABELS[role] || '—';

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Menú de usuario"
      className="absolute right-0 top-full mt-2 w-72 z-50 rounded-lg border border-outline-soft bg-surface-container-lowest shadow-[0_20px_50px_-18px_rgba(0,0,0,0.55)] animate-slide-down overflow-hidden user-dropdown-card"
    >
      <div className="flex items-center gap-3 px-4 py-4 border-b border-outline-soft bg-surface-container-low">
        <div className="w-11 h-11 rounded-full bg-[var(--btn-primary-bg)] border border-[var(--btn-primary-border)] flex items-center justify-center text-[var(--btn-primary-text)] font-extrabold text-sm font-mono shadow-[var(--btn-primary-shadow)]">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">{fullName}</p>
          <p className="font-label text-[10px] text-secondary mt-0.5">{roleLabel}</p>
        </div>
      </div>

      <div className="p-2">
        <button
          type="button"
          onClick={() => {
            navigate('/profile');
            onClose?.();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-on-surface hover:bg-surface-container-high transition-colors text-left"
        >
          <span className="w-8 h-8 rounded-md bg-surface-container border border-outline-soft flex items-center justify-center">
            <User className="w-4 h-4 text-secondary" />
          </span>
          <span className="font-medium">Mi perfil</span>
        </button>

        <div className="mt-2 rounded-md border border-outline-soft bg-surface-container-low p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-on-surface">Tema</span>
            <span className="font-label text-[10px] text-on-surface-variant">
              {mode === 'dark' ? 'Oscuro' : 'Claro'}
            </span>
          </div>
          <div role="tablist" aria-label="Tema" className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'dark'}
              onClick={() => setMode('dark')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-md border px-3 py-2 transition-all duration-200',
                mode === 'dark'
                  ? 'btn-primary-style'
                  : 'theme-tab-btn'
              )}
            >
              <Moon className="w-4 h-4" />
              Oscuro
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'light'}
              onClick={() => setMode('light')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-md border px-3 py-2 transition-all duration-200',
                mode === 'light'
                  ? 'btn-primary-style'
                  : 'theme-tab-btn'
              )}
            >
              <Sun className="w-4 h-4" />
              Claro
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-outline-soft p-2 bg-surface-container-low">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-error-bright hover:bg-error/10 transition-colors text-left"
        >
          <span className="w-8 h-8 rounded-md bg-error/10 border border-error/20 flex items-center justify-center">
            <LogOut className="w-4 h-4" />
          </span>
          <span className="font-semibold">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;
