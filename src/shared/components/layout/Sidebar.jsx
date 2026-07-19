import { useEffect } from 'react';
import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  Camera,
  Users,
  UserCog,
  Shirt,
  AlertTriangle,
  CalendarCheck,
  BarChart3,
  Scan,
  History,
  Box,
  FlaskConical,
  X,
  Bell,
  BookOpen,
} from 'lucide-react';
import logo from '../../../assets/logo.png';
import { useAuthStore } from '../../../features/auth/stores/authStore.js';
import { ROLES } from '../../../shared/utils/constants.js';
import { cn } from '../../../shared/utils/cn.js';

const buildItems = (role) => {
  const items = [
    {
      to: '/dashboard',
      label: 'Panel de Control',
      icon: LayoutDashboard,
      roles: [ROLES.ADMIN, ROLES.COORDINATOR],
    },
    {
      to: '/monitoring',
      label: 'Monitoreo',
      icon: Camera,
      roles: [ROLES.ADMIN, ROLES.COORDINATOR],
    },
    /* Asistencias - DESACTIVADO
    {
      to: '/attendance',
      label: 'Asistencias',
      icon: CalendarCheck,
      roles: [ROLES.ADMIN, ROLES.COORDINATOR],
    },
    */
    {
      to: '/coordinators',
      label: 'Coordinadores',
      icon: UserCog,
      roles: [ROLES.ADMIN],
    },
    {
      to: '/students',
      label: 'Estudiantes',
      icon: Users,
      roles: [ROLES.ADMIN, ROLES.COORDINATOR],
    },
    /* Uniformes - DESACTIVADO
    {
      to: '/uniforms',
      label: 'Uniformes',
      icon: Shirt,
      roles: [ROLES.ADMIN, ROLES.COORDINATOR],
    },
    */
    {
      to: '/alerts',
      label: 'Alertas',
      icon: AlertTriangle,
      roles: [ROLES.ADMIN, ROLES.COORDINATOR],
    },
    /* Bitácoras - DESACTIVADO
    {
      to: '/audits',
      label: 'Bitácoras',
      icon: History,
      roles: [ROLES.ADMIN],
    },
    */
    {
      to: '/cameras',
      label: 'Cámaras',
      icon: Camera,
      roles: [ROLES.ADMIN],
    },
    /* Test de detección - DESACTIVADO
    {
      to: '/admin/test-detection',
      label: 'Test de detección',
      icon: FlaskConical,
      roles: [ROLES.ADMIN],
    },
    */
    {
      to: '/docs',
      label: 'Documentación',
      icon: BookOpen,
      roles: [ROLES.ADMIN],
    },
    /* Inspecciones - DESACTIVADO
    {
      to: '/inspections',
      label: 'Inspecciones',
      icon: Scan,
      roles: [ROLES.ADMIN, ROLES.COORDINATOR],
    },
    */
    {
      to: '/statistics',
      label: 'Estadísticas',
      icon: BarChart3,
      roles: [ROLES.ADMIN, ROLES.COORDINATOR],
    },
    {
      to: '/models',
      label: 'Personalizador 3D',
      icon: Box,
      roles: [ROLES.ADMIN],
    },
    {
      to: '/preferences/alerts',
      label: 'Preferencias',
      icon: Bell,
      roles: [ROLES.COORDINATOR],
    },
  ];
  return items.filter((item) => item.roles.includes(role));
};

const SidebarContent = ({ onNavigate, items }) => (
  <>
    <div className="px-6 pb-5 pt-2 flex items-center gap-3">
      <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
        <div className="absolute inset-0 bg-amber-400/25 rounded-lg blur-md" aria-hidden />
        <img
          src={logo}
          alt="AI Sentinel"
          className="w-11 h-11 object-contain relative z-10"
          style={{ filter: 'drop-shadow(0 0 8px rgba(245,197,58,0.45))' }}
        />
      </div>
      <div className="min-w-0">
        <h1 className="font-display text-lg font-extrabold text-on-surface leading-tight tracking-tight">
          <span className="wordmark-gradient">AI SENTINEL</span>
        </h1>
        <p className="font-label text-[10px] text-amber-300/80">Control Escolar</p>
      </div>
    </div>

    <div className="px-6 pb-3">
      <div className="h-px divider-amber opacity-40" aria-hidden />
    </div>

    <nav className="flex-1 overflow-y-auto px-3" aria-label="Menú principal">
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={
                  item.to === '/dashboard' || item.to === '/cameras' || item.to === '/monitoring'
                }
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-3 h-10 px-3.5 rounded-md text-sm transition-all duration-200 group',
                    isActive
                      ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-extrabold shadow-[0_0_20px_rgba(245,197,58,0.28),inset_0_2px_4px_rgba(0,0,0,0.14)]'
                      : 'text-[var(--sidebar-item-text)] hover:bg-[var(--sidebar-item-hover-bg)] hover:text-[var(--sidebar-item-hover-text)] hover:translate-x-0.5 font-semibold'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-300 rounded-r-full shadow-[0_0_8px_rgba(255,212,90,0.8)]"
                        aria-hidden
                      />
                    )}
                    <Icon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: isActive ? 'var(--sidebar-active-text)' : 'inherit' }}
                    />
                    <span
                      className="text-[13px] font-semibold tracking-normal truncate"
                      style={{ color: isActive ? 'var(--sidebar-active-text)' : 'inherit' }}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <span
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-800 animate-pulse"
                        aria-hidden
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  </>
);

const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const role = useAuthStore((s) => s.role);
  const items = buildItems(role);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseMobile?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, onCloseMobile]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <aside
        className="hidden md:flex flex-col bg-surface-container fixed left-0 top-0 h-screen w-[280px] border-r border-white/5 shadow-xl z-20 py-6 noise-overlay"
        aria-label="Navegación principal"
      >
        <div
          className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-amber-400/30 to-transparent"
          aria-hidden
        />
        <SidebarContent items={items} />
      </aside>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
          />
          <aside className="relative w-[280px] max-w-[85vw] h-full bg-surface-container border-r border-white/10 shadow-2xl flex flex-col py-6 animate-slide-right">
            <button
              type="button"
              onClick={onCloseMobile}
              className="absolute top-4 right-4 p-1.5 rounded-md text-on-surface-variant hover:text-amber-300 hover:bg-white/10"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent items={items} onNavigate={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
