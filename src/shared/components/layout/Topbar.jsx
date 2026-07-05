import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router';
import { Search, Bell, Menu } from 'lucide-react';
import { useAuthStore } from '../../../features/auth/stores/authStore.js';
import { ROLE_LABELS } from '../../../shared/utils/constants.js';
import NotificationPanel from '../../../features/notifications/components/NotificationPanel.jsx';
import UserDropdown from './UserDropdown.jsx';
import CommandPalette from './CommandPalette.jsx';
import { useNotificationStore } from '../../../features/notifications/stores/notificationStore.js';

const labels = {
  dashboard: 'Panel',
  monitoring: 'Monitoreo',
  students: 'Estudiantes',
  coordinators: 'Coordinadores',
  uniforms: 'Uniformes',
  alerts: 'Alertas',
  attendance: 'Asistencias',
  statistics: 'Estadísticas',
  inspections: 'Inspecciones',
  audits: 'Bitácoras',
  models: 'Modelos 3D',
  cameras: 'Cámaras',
  profile: 'Perfil',
  create: 'Crear',
  edit: 'Editar',
  preferences: 'Preferencias',
  alerts2: 'Alertas',
};

const Topbar = ({ onOpenMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const segments = location.pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: labels[seg] || seg,
    path: '/' + segments.slice(0, i + 1).join('/'),
  }));

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header
        className="bg-background/80 backdrop-blur-md border-b border-white/10 shadow-sm flex justify-between items-center w-full px-4 md:px-8 h-16 md:h-20 shrink-0 z-10 sticky top-0"
        role="banner"
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-md text-on-surface-variant hover:text-amber-300 hover:bg-white/5"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <nav aria-label="Migas de pan" className="flex items-center gap-2 text-sm min-w-0">
            {crumbs.length === 0 ? (
              <span className="font-label text-on-surface">Panel</span>
            ) : (
              crumbs.map((crumb, i) => (
                <span key={crumb.path} className="flex items-center gap-2 min-w-0">
                  {i > 0 && <span className="text-on-surface-dim text-xs">/</span>}
                  {i === crumbs.length - 1 ? (
                    <span className="font-label text-amber-300 truncate">{crumb.label}</span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-on-surface-variant hover:text-amber-300 truncate"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))
            )}
          </nav>
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 h-10 input-glow rounded-md w-56 text-on-surface-dim hover:border-amber-400/40 transition-colors"
            aria-label="Buscar"
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm flex-1 text-left">Buscar…</span>
            <kbd className="font-mono text-[10px] text-on-surface-dim border border-white/10 px-1.5 py-0.5 rounded">
              Ctrl K
            </kbd>
          </button>

          <button
            type="button"
            data-notifications-trigger
            onClick={() => {
              setUserOpen(false);
              setNotifOpen((v) => !v);
            }}
            className="text-on-surface-variant hover:text-amber-300 hover:bg-white/5 p-2 rounded-full relative transition-colors"
            aria-label="Notificaciones"
            aria-expanded={notifOpen}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-amber-400 text-amber-900 text-[10px] font-bold rounded-full border-2 border-background flex items-center justify-center font-mono">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <div className="h-8 w-px bg-white/10 mx-1 hidden md:block" />

          <button
            type="button"
            data-user-trigger
            onClick={() => {
              setNotifOpen(false);
              setUserOpen((v) => !v);
            }}
            className="flex items-center gap-3 rounded-full pr-2 text-on-surface hover:bg-surface-container-high/70 transition-colors"
            aria-label="Menú de usuario"
            aria-expanded={userOpen}
          >
            <div className="w-10 h-10 rounded-full bg-[var(--btn-primary-bg)] border border-[var(--btn-primary-border)] flex items-center justify-center text-[var(--btn-primary-text)] font-extrabold text-sm font-mono shadow-[var(--btn-primary-shadow)]">
              {(user?.name?.[0] || '').toUpperCase()}
              {(user?.surname?.[0] || '').toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block min-w-0 text-left">
              <p className="text-sm font-semibold text-on-surface leading-none truncate max-w-[140px]">
                {user?.name} {user?.surname}
              </p>
              <p className="font-label text-[10px] text-secondary mt-0.5">
                {ROLE_LABELS[role] || '—'}
              </p>
            </div>
          </button>
        </div>
      </header>

      <div className="relative">
        <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>
      <div className="relative">
        <UserDropdown open={userOpen} onClose={() => setUserOpen(false)} />
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
};

export default Topbar;
