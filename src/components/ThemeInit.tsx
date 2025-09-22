"use client";

import { useEffect } from "react";
import { useThemeStore, type Theme } from "~/lib/theme";

export default function ThemeInit() {
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    // Read from DOM set by the inline script
    const attr = document.documentElement.getAttribute(
      "data-theme",
    ) as Theme | null;
    if (attr === "light" || attr === "dark") {
      setTheme(attr);
    } else {
      // Fallback to store's initialize logic
      try {
        useThemeStore.getState().initialize();
      } catch {}
    }

    // Keep in sync with system if user hasn't saved a preference
    const key = "theme";
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      const hasSaved = Boolean(window.localStorage.getItem(key));
      if (!hasSaved) {
        const sysTheme: Theme = e.matches ? "dark" : "light";
        setTheme(sysTheme);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setTheme]);

  return null;
}
