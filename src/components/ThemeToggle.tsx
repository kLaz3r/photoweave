"use client";

import { useEffect } from "react";
import { useThemeStore } from "~/lib/theme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    useThemeStore.getState().initTheme();
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className="bg-background text-text border-accent hover:bg-secondary fixed top-4 right-4 z-10 rounded-lg border p-2 transition-colors duration-200"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-text"
        >
          <circle
            cx="12"
            cy="12"
            r="4"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
          <path
            d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-text"
        >
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
