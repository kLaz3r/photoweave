"use client";

import { useEffect, useRef } from "react";
import { useThemeStore } from "~/lib/theme";

export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement | null>(null);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const isDark = useThemeStore((s) => s.theme === "dark");

  useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    let rafId: number | null = null;
    let isRafRunning = false;

    const stopRaf = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
        isRafRunning = false;
      }
    };

    const startRaf = () => {
      if (isRafRunning) return;
      isRafRunning = true;
      const tick = () => {
        if (!isRafRunning) return;
        const smoothing = 0.15;
        currentProgress.current +=
          (targetProgress.current - currentProgress.current) * smoothing;
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${currentProgress.current})`;
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      targetProgress.current = Math.min(1, Math.max(0, progress));

      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(stopRaf, 300);
      startRaf();
    };

    updateScrollProgress();
    startRaf();

    window.addEventListener("scroll", updateScrollProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      if (scrollTimer) clearTimeout(scrollTimer);
      stopRaf();
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
