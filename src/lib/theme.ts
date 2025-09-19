import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initialize: () => void;
}

const STORAGE_KEY = "theme";

function applyThemeToDocument(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme: Theme) => {
        set({ theme });
        applyThemeToDocument(theme);
      },
      toggleTheme: () => {
        const current = get().theme;
        const next = current === "light" ? "dark" : "light";
        get().setTheme(next);
      },
      initialize: () => {
        if (typeof window === "undefined") return;

        const saved =
          (window.localStorage.getItem(STORAGE_KEY) as Theme | null) ?? null;
        const system: Theme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        const initial = saved ?? system;
        set({ theme: initial });
        applyThemeToDocument(initial);

        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = (e: MediaQueryListEvent) => {
          const hasSaved = Boolean(window.localStorage.getItem(STORAGE_KEY));
          if (!hasSaved) {
            const sysTheme: Theme = e.matches ? "dark" : "light";
            get().setTheme(sysTheme);
          }
        };
        mq.addEventListener("change", onChange);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);

export function initializeTheme(): void {
  // Delegate to the store's initialize to keep logic in one place
  try {
    useThemeStore.getState().initialize();
  } catch {
    // no-op on server or if store not ready
  }
}
