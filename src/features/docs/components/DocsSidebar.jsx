import { NavLink } from 'react-router';
import { DOCS_SECTIONS } from '../docs.constants.js';
import { cn } from '../../../shared/utils/cn.js';

const DocsSidebar = () => (
  <nav
    aria-label="Secciones de la documentación"
    className="hidden lg:flex w-64 shrink-0 flex-col gap-1 border-r border-white/10 bg-surface-container-low/40 p-4 overflow-y-auto"
  >
    <p className="font-label text-[10px] tracking-[0.18em] text-on-surface-dim uppercase px-3 pb-2">
      Contenido
    </p>
    {DOCS_SECTIONS.map(({ id, label, Icon }) => (
      <NavLink
        key={id}
        to={`/docs/${id}`}
        className={({ isActive }) =>
          cn(
            'group flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors',
            isActive
              ? 'bg-amber-400/10 text-amber-200 border border-amber-400/30'
              : 'text-on-surface-variant border border-transparent hover:text-amber-300 hover:bg-white/[0.04] hover:border-white/10'
          )
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              className={cn(
                'w-4 h-4 shrink-0',
                isActive ? 'text-amber-300' : 'text-on-surface-dim group-hover:text-amber-300'
              )}
            />
            <span className="font-label tracking-wide">{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

export default DocsSidebar;
