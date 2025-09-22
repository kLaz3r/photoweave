"use client";

import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { useThemeStore } from "~/lib/theme";

type ThemeToggleProps = {
  className?: string;
  size?: number;
};

export default function ThemeToggle({
  className = "",
  size = 20,
}: ThemeToggleProps) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={[
        "text-text transition-colors duration-200",
        "hover:text-primary",
        className,
      ].join(" ")}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {!mounted ? (
        <FiSun size={size} className="text-text" aria-hidden="true" />
      ) : theme === "light" ? (
        <FiSun size={size} className="text-text" aria-hidden="true" />
      ) : (
        <FiMoon size={size} className="text-text" aria-hidden="true" />
      )}
    </button>
  );
}
