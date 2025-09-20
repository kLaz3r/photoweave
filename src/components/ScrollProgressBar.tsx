"use client";

import { useEffect, useState } from "react";

export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDark(theme === "dark");
    };

    // Initial calculations
    updateScrollProgress();
    checkTheme();

    // Add scroll event listener
    window.addEventListener("scroll", updateScrollProgress, { passive: true });

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Cleanup
    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 z-50 h-[5px] w-full">
      <div
        className={`bg-accent h-full blur-[1px] transition-all duration-150 ease-out ${
          isDark ? "opacity-30" : "opacity-100"
        }`}
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
