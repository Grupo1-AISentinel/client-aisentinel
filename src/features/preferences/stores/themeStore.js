import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORAGE_KEY = 'aisentinel.theme';
const VALID_THEMES = ['dark', 'light'];

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.mode && VALID_THEMES.includes(parsed.state.mode)) {
        return parsed.state.mode;
      }
    }
  } catch {
    /* ignore */
  }
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
};

const applyTheme = (mode) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (mode === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.setAttribute('data-theme', 'dark');
  }
};

const initial = getInitialTheme();
applyTheme(initial);

export const useThemeStore = create(
  persist(
    (set) => ({
      mode: initial,
      setMode: (mode) => {
        if (!VALID_THEMES.includes(mode)) return;
        applyTheme(mode);
        set({ mode });
      },
      toggle: () => {
        set((s) => {
          const next = s.mode === 'dark' ? 'light' : 'dark';
          applyTheme(next);
          return { mode: next };
        });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);
