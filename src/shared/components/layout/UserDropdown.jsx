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
  const toggleTheme = useThemeStore((s) => s.toggle);
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
      className="absolute right-0 top-full mt-2 w-64 z-50 glass-panel-solid rounded-xl shadow-elevated border border-white/15 animate-slide-down overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold text-sm font-mono">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">{fullName}</p>
          <p className="font-label text-[10px] text-amber-300/80 mt-0.5">{roleLabel}</p>
        </div>
      </div>

      <div className="py-1">
        <button
          type="button"
          onClick={() => {
            navigate('/profile');
            onClose?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-white/5 transition-colors text-left"
        >
          <User className="w-4 h-4 text-on-surface-variant" />
          Mi perfil
        </button>

        <div className="px-4 py-2 flex items-center gap-3">
          <span className="text-sm text-on-surface-variant flex-1">Tema</span>
          <div
            role="tablist"
            aria-label="Tema"
            className="flex rounded-md border border-white/10 overflow-hidden text-xs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'dark'}
              onClick={() => mode !== 'dark' && toggleTheme()}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 transition-colors',
                mode === 'dark'
                  ? 'bg-amber-400 text-amber-900 font-bold'
                  : 'text-on-surface-variant hover:bg-amber-400/5'
              )}
            >
              <Moon className="w-3 h-3" />
              Oscuro
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'light'}
              onClick={() => mode !== 'light' && toggleTheme()}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 transition-colors',
                mode === 'light'
                  ? 'bg-amber-400 text-amber-900 font-bold'
                  : 'text-on-surface-variant hover:bg-amber-400/5'
              )}
            >
              <Sun className="w-3 h-3" />
              Claro
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-1">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error-bright hover:bg-error/10 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;
