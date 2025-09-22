"use client";

import React from "react";

interface AmbientBackgroundProps {
  /** Overall opacity of the ambient layer (0-1) */
  opacity?: number;
  /** Optional extra class names */
  className?: string;
}

/**
 * Site-wide subtle ambient background using layered radial gradients.
 * It intentionally avoids the hero's exact shapes but keeps a related palette.
 * A vertical mask fades it out near the top so the hero remains distinct.
 */
const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  opacity = 0.18,
  className = "",
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let docHeight = 1;

    // Randomized seed per mount/refresh
    const seed = {
      base: {
        aX: 75 + Math.random() * 20, // 75-95
        aY: 8 + Math.random() * 16, // 8-24
        bX: 10 + Math.random() * 20, // 10-30
        bY: 30 + Math.random() * 20, // 30-50
        cX: 60 + Math.random() * 20, // 60-80
        cY: 65 + Math.random() * 25, // 65-90
      },
      amp: {
        aX: 8 + Math.random() * 14, // 8-22
        aY: 6 + Math.random() * 12, // 6-18
        bX: 10 + Math.random() * 20, // 10-30
        bY: 6 + Math.random() * 12, // 6-18
        cX: 8 + Math.random() * 18, // 8-26
        cY: 10 + Math.random() * 20, // 10-30
      },
      size: {
        aSx: 52 + Math.random() * 18, // 52-70
        aSy: 40 + Math.random() * 20, // 40-60
        bSx: 38 + Math.random() * 16, // 38-54
        bSy: 28 + Math.random() * 16, // 28-44
        cSx: 26 + Math.random() * 16, // 26-42
        cSy: 20 + Math.random() * 16, // 20-36
      },
      mixBase: {
        accent: 20 + Math.random() * 12, // 20-32
        primary: 14 + Math.random() * 10, // 14-24
      },
    } as const;

    // Apply size seeds once
    el.style.setProperty("--ambient-a-sx", `${seed.size.aSx.toFixed(2)}%`);
    el.style.setProperty("--ambient-a-sy", `${seed.size.aSy.toFixed(2)}%`);
    el.style.setProperty("--ambient-b-sx", `${seed.size.bSx.toFixed(2)}%`);
    el.style.setProperty("--ambient-b-sy", `${seed.size.bSy.toFixed(2)}%`);
    el.style.setProperty("--ambient-c-sx", `${seed.size.cSx.toFixed(2)}%`);
    el.style.setProperty("--ambient-c-sy", `${seed.size.cSy.toFixed(2)}%`);

    // Theme-aware blend and vignette strength
    const theme =
      document.documentElement.getAttribute("data-theme") ?? "light";
    const isDark = theme === "dark";
    el.style.setProperty("--ambient-blend", isDark ? "screen" : "multiply");
    el.style.setProperty("--ambient-vignette-strength", isDark ? "6%" : "10%");

    const computeDocHeight = () => {
      const body = document.body;
      const html = document.documentElement;
      docHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight,
      );
    };

    const update = () => {
      frame = 0;
      const scrollY = window.scrollY || window.pageYOffset;
      const viewport = window.innerHeight || 1;
      const maxScroll = Math.max(docHeight - viewport, 1);
      const p = Math.min(Math.max(scrollY / maxScroll, 0), 1);

      // Parallax translate (subtle)
      const translateY = -20 * p; // px

      // Animate blob centers
      const aX = seed.base.aX - seed.amp.aX * p; // %
      const aY = seed.base.aY + seed.amp.aY * p; // %
      const bX = seed.base.bX + seed.amp.bX * p; // %
      const bY = seed.base.bY - seed.amp.bY * p; // %
      const cX = seed.base.cX - seed.amp.cX * p; // %
      const cY = seed.base.cY - seed.amp.cY * p; // %

      // Color mix strengths breathe slightly with scroll
      const accentMix = seed.mixBase.accent + 12 * Math.sin(p * Math.PI); // ~20-44
      const primaryMix =
        seed.mixBase.primary + 10 * (1 - Math.cos(p * Math.PI)); // ~14-34

      el.style.setProperty(
        "--ambient-translate-y",
        `${translateY.toFixed(2)}px`,
      );
      el.style.setProperty("--ambient-a-x", `${aX.toFixed(2)}%`);
      el.style.setProperty("--ambient-a-y", `${aY.toFixed(2)}%`);
      el.style.setProperty("--ambient-b-x", `${bX.toFixed(2)}%`);
      el.style.setProperty("--ambient-b-y", `${bY.toFixed(2)}%`);
      el.style.setProperty("--ambient-c-x", `${cX.toFixed(2)}%`);
      el.style.setProperty("--ambient-c-y", `${cY.toFixed(2)}%`);
      el.style.setProperty("--ambient-accent-mix", `${accentMix.toFixed(2)}%`);
      el.style.setProperty(
        "--ambient-primary-mix",
        `${primaryMix.toFixed(2)}%`,
      );
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update) as unknown as number;
    };

    const onResize = () => {
      computeDocHeight();
      update();
    };

    computeDocHeight();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
      style={{ opacity }}
      aria-hidden
    >
      {/* Gradient canvas */}
      <div
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(var(--ambient-a-sx, 60%) var(--ambient-a-sy, 50%) at var(--ambient-a-x, 85%) var(--ambient-a-y, 15%), var(--theme-secondary) 0%, transparent 60%),` +
            `radial-gradient(var(--ambient-b-sx, 45%) var(--ambient-b-sy, 35%) at var(--ambient-b-x, 20%) var(--ambient-b-y, 40%), color-mix(in oklch, var(--theme-accent) var(--ambient-accent-mix, 25%), transparent) 0%, transparent 70%),` +
            `radial-gradient(var(--ambient-c-sx, 30%) var(--ambient-c-sy, 25%) at var(--ambient-c-x, 70%) var(--ambient-c-y, 80%), color-mix(in oklch, var(--theme-primary) var(--ambient-primary-mix, 20%), transparent) 0%, transparent 70%)`,
          filter: "blur(24px)",
          transform: "translate3d(0, var(--ambient-translate-y, 0px), 0)",
          maskImage:
            "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 10%, rgba(255,255,255,0.8) 40%, rgba(255,255,255,1) 65%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 10%, rgba(255,255,255,0.8) 40%, rgba(255,255,255,1) 65%)",
          mixBlendMode: "var(--ambient-blend, normal)",
        }}
      />

      {/* Subtle vignette for added contrast on text edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 50%, transparent 55%, color-mix(in oklch, var(--theme-text) var(--ambient-vignette-strength, 6%), transparent) 100%)",
        }}
      />
    </div>
  );
};

export default AmbientBackground;
