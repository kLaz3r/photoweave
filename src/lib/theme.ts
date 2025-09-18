import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  systemTheme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      systemTheme: "light",
      setTheme: (theme: Theme) => {
        set({ theme });
        // Update HTML data-theme attribute
        if (typeof window !== "undefined") {
          document.documentElement.setAttribute("data-theme", theme);
        }
      },
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === "light" ? "dark" : "light";
        get().setTheme(newTheme);
      },
      initTheme: () => {
        if (typeof window === "undefined") return;

        const savedTheme = localStorage.getItem("theme") as Theme | null;
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";

        const initialTheme = savedTheme ?? systemTheme;
        set({ theme: initialTheme, systemTheme });

        // Set initial HTML attribute
        document.documentElement.setAttribute("data-theme", initialTheme);

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
          set({ systemTheme: e.matches ? "dark" : "light" });
          // If no saved theme, follow system
          if (!savedTheme) {
            get().setTheme(e.matches ? "dark" : "light");
          }
        };
        mediaQuery.addEventListener("change", handleChange);

        // Cleanup is handled by React, but we can return a cleanup function
        return () => mediaQuery.removeEventListener("change", handleChange);
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
