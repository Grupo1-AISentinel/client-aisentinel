import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
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
  User,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useThemeStore } from '../../../features/preferences/stores/themeStore.js';
import { useAuthStore } from '../../../features/auth/stores/authStore.js';
import { ROLES, ROLE_LABELS } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';

const buildItems = (navigate, isAdmin, themeMode, setMode, handleLogout) => [
  {
    section: 'Navegación',
    items: [
      {
        id: 'go-dashboard',
        label: 'Panel de Control',
        icon: LayoutDashboard,
        shortcut: 'G D',
        action: () => navigate('/dashboard'),
      },
      {
        id: 'go-monitoring',
        label: 'Monitoreo en vivo',
        icon: Camera,
        shortcut: 'G M',
        action: () => navigate('/monitoring'),
      },
      {
        id: 'go-attendance',
        label: 'Asistencias',
        icon: CalendarCheck,
        shortcut: 'G A',
        action: () => navigate('/attendance'),
      },
      ...(isAdmin
        ? [{ id: 'go-cameras', label: 'Cámaras', icon: Camera, action: () => navigate('/cameras') }]
        : []),
      {
        id: 'go-students',
        label: 'Estudiantes',
        icon: Users,
        shortcut: 'G E',
        action: () => navigate('/students'),
      },
      ...(isAdmin
        ? [
            {
              id: 'go-coordinators',
              label: 'Coordinadores',
              icon: UserCog,
              action: () => navigate('/coordinators'),
            },
            {
              id: 'go-bitacora',
              label: 'Bitácoras',
              icon: History,
              action: () => navigate('/audits'),
            },
            { id: 'go-models', label: 'Modelos 3D', icon: Box, action: () => navigate('/models') },
          ]
        : []),
      { id: 'go-uniforms', label: 'Uniformes', icon: Shirt, action: () => navigate('/uniforms') },
      { id: 'go-alerts', label: 'Alertas', icon: AlertTriangle, action: () => navigate('/alerts') },
      {
        id: 'go-inspections',
        label: 'Inspecciones',
        icon: Scan,
        action: () => navigate('/inspections'),
      },
      {
        id: 'go-statistics',
        label: 'Estadísticas',
        icon: BarChart3,
        action: () => navigate('/statistics'),
      },
    ],
  },
  {
    section: 'Cuenta',
    items: [
      { id: 'go-profile', label: 'Mi perfil', icon: User, action: () => navigate('/profile') },
    ],
  },
  {
    section: 'Apariencia',
    items: [
      {
        id: 'theme-toggle',
        label: themeMode === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro',
        icon: themeMode === 'dark' ? Sun : Moon,
        action: () => setMode(themeMode === 'dark' ? 'light' : 'dark'),
      },
    ],
  },
  {
    section: 'Sesión',
    items: [
      { id: 'logout', label: 'Cerrar sesión', icon: LogOut, danger: true, action: handleLogout },
    ],
  },
];

const CommandPalette = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === ROLES.ADMIN;
  const logout = useAuthStore((s) => s.logout);
  const themeMode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate('/login', { replace: true });
  };

  const sections = useMemo(
    () => buildItems(navigate, isAdmin, themeMode, setMode, handleLogout),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, isAdmin, themeMode, setMode]
  );

  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  const filtered = useMemo(() => {
    if (!query) return flat;
    const q = query.toLowerCase();
    return flat.filter((it) => it.label.toLowerCase().includes(q));
  }, [flat, query]);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');

      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filtered[activeIndex];
        if (item) {
          item.action();
          onClose?.();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, filtered, activeIndex]);

  useEffect(() => {
    if (activeIndex >= filtered.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveIndex(0);
    }
  }, [activeIndex, filtered.length]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4 animate-fade-in"
      role="dialog"
      aria-label="Paleta de comandos"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl glass-panel-solid rounded-xl shadow-elevated border border-white/15 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="w-5 h-5 text-on-surface-dim" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe para buscar páginas, acciones..."
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-dim outline-none"
          />
          <kbd className="hidden sm:inline-block font-mono text-[10px] text-on-surface-dim border border-white/10 px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-on-surface-dim text-center py-8">
              Sin resultados para "{query}"
            </p>
          ) : (
            (() => {
              const seenSections = new Set();
              return filtered.map((item) => {
                const section = sections.find((s) => s.items.includes(item));
                const showHeader = section && !seenSections.has(section.section);
                if (section) seenSections.add(section.section);
                const Icon = item.icon;
                const isActive = flat.indexOf(item) === activeIndex;
                return (
                  <div key={item.id}>
                    {showHeader && (
                      <p className="font-label text-[10px] text-on-surface-variant px-3 py-1.5 mt-1 tracking-wide">
                        {section.section}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        item.action();
                        onClose?.();
                      }}
                      onMouseEnter={() => setActiveIndex(flat.indexOf(item))}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors',
                        isActive
                          ? item.danger
                            ? 'bg-error/15 text-error-bright'
                            : 'bg-amber-400/15 text-amber-300'
                          : item.danger
                            ? 'text-error-bright hover:bg-error/10'
                            : 'text-on-surface hover:bg-amber-400/5'
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.shortcut && (
                        <kbd className="font-mono text-[10px] text-on-surface-dim border border-white/10 px-1.5 py-0.5 rounded">
                          {item.shortcut}
                        </kbd>
                      )}
                    </button>
                  </div>
                );
              });
            })()
          )}
        </div>

        <footer className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-[10px] text-amber-300/80 font-label">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="font-mono border border-amber-400/30 px-1 rounded text-amber-300">
                ↑↓
              </kbd>{' '}
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono border border-amber-400/30 px-1 rounded text-amber-300">
                ↵
              </kbd>{' '}
              ejecutar
            </span>
          </span>
          <span className="text-secondary">{ROLE_LABELS[role] || '—'}</span>
        </footer>
      </div>
    </div>
  );
};

export default CommandPalette;
