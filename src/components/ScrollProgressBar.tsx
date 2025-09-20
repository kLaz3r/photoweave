"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement | null>(null);
  const targetProgress = useRef(0); // 0..1
  const currentProgress = useRef(0); // 0..1
  const rafId = useRef<number | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      targetProgress.current = Math.min(1, Math.max(0, progress));
    };

    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDark(theme === "dark");
    };

    // Initial calculations
    updateScrollProgress();
    checkTheme();

    // RAF-driven smoothing (lerp)
    const tick = () => {
      const smoothing = 0.15; // lower = smoother, higher = snappier
      currentProgress.current +=
        (targetProgress.current - currentProgress.current) * smoothing;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${currentProgress.current})`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

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
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed top-0 left-0 z-[70] h-[5px] w-full">
      <div
        ref={barRef}
        className={`bg-accent h-full origin-left transform-gpu blur-[1px] will-change-transform ${
          isDark ? "opacity-30" : "opacity-100"
        }`}
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
