import { useState, useMemo, useDeferredValue } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Search, X, BookOpen } from 'lucide-react';
import DocsSidebar from '../../features/docs/components/DocsSidebar.jsx';
import { DOCS_SECTIONS } from '../../features/docs/docs.constants.js';
import { searchIndex } from '../../features/docs/data/searchIndex.js';
import ConstellationBackground from '../../shared/components/feedback/ConstellationBackground.jsx';
import { cn } from '../../shared/utils/cn.js';

const DocsLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);

  const results = useMemo(() => {
    if (!deferred) return [];
    const q = deferred.toLowerCase();
    return searchIndex.filter(
      (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  }, [deferred]);

  const handleSelectResult = (r) => {
    if (r.tab && DOCS_SECTIONS.some((s) => s.id === r.tab)) {
      navigate(`/docs/${r.tab}`);
      setQuery('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface overflow-hidden">
      <DocsSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 py-3 bg-background/90 backdrop-blur-md border-b border-white/10">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/10 bg-white/[0.03] text-on-surface hover:text-amber-300 hover:border-amber-400/30 transition-colors text-[12.5px] font-label"
            aria-label="Volver al dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al dashboard
          </button>

          <div className="flex items-center gap-2 ml-2 mr-auto">
            <div className="w-7 h-7 rounded-md bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-amber-300" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-semibold text-on-surface">
                Documentación
              </span>
              <span className="font-mono text-[10px] text-on-surface-dim">
                AI Sentinel · API Reference &amp; Arquitectura
              </span>
            </div>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-dim pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en toda la documentación..."
              className="w-full pl-10 pr-9 py-2 rounded-md bg-white/[0.04] border border-white/10 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 text-[13px] text-on-surface placeholder:text-on-surface-dim"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Limpiar"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-on-surface-dim hover:text-amber-300 hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {deferred && (
          <div
            className={cn(
              'sticky top-[64px] z-20 px-4 md:px-6 py-2 bg-background/95 backdrop-blur-md border-b border-white/10'
            )}
          >
            {results.length === 0 ? (
              <p className="text-[12.5px] text-on-surface-variant py-1">
                Sin resultados para <span className="text-amber-300">"{deferred}"</span>
              </p>
            ) : (
              <div className="max-h-[260px] overflow-y-auto rounded-md border border-white/10 bg-black/40">
                {results.slice(0, 20).map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectResult(r)}
                    className="w-full text-left px-3 py-2 border-b border-white/5 last:border-b-0 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-amber-300 truncate">
                        {r.title}
                      </span>
                      <span className="ml-auto font-label text-[9px] uppercase tracking-widest text-on-surface-dim shrink-0">
                        {r.type}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-on-surface-variant line-clamp-1 mt-0.5">
                      {r.description}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <main className="flex-1 overflow-y-auto relative animate-fade-in">
          <ConstellationBackground seed={42} maxDistance={130} className="opacity-30" />
          <div
            className="relative z-10 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto"
            key={location.pathname}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocsLayout;
