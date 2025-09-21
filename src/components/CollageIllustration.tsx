"use client";

import React from "react";

type CollageIllustrationProps = {
  className?: string;
  width?: number;
  height?: number;
  title?: string;
};

/**
 * Renders the `public/collage-illustration.svg` inline and remaps palette
 * colors to CSS variables so it responds to theme changes.
 *
 * Mappings:
 * - Primary → var(--theme-primary)
 * - Secondary → var(--theme-secondary)
 * - Illustration Dark → var(--theme-illustration-dark)
 * - Light → var(--theme-background)
 */
export default function CollageIllustration({
  className = "",
  width,
  height,
  title,
}: CollageIllustrationProps) {
  const [svgHtml, setSvgHtml] = React.useState<string>("");

  React.useEffect(() => {
    let isMounted = true;

    const remapColors = (raw: string): string => {
      // Replace fills and strokes for known palette values with CSS variables
      const replacements: Array<[RegExp, string]> = [
        // Illustration dark
        [/fill="#3C120C"/g, 'fill="var(--theme-illustration-dark)"'],
        [/stroke="#3C120C"/g, 'stroke="var(--theme-illustration-dark)"'],
        // Primary
        [/fill="#D4422E"/g, 'fill="var(--theme-primary)"'],
        [/stroke="#D4422E"/g, 'stroke="var(--theme-primary)"'],
        // Secondary
        [/fill="#F0BE8F"/g, 'fill="var(--theme-secondary)"'],
        [/stroke="#F0BE8F"/g, 'stroke="var(--theme-secondary)"'],
        // Light (if any bright/white-like fills exist)
        [/fill="#FFFFFF"/gi, 'fill="var(--theme-background)"'],
        [/stroke="#FFFFFF"/gi, 'stroke="var(--theme-background)"'],
        [/fill="#FFF"/gi, 'fill="var(--theme-background)"'],
        [/stroke="#FFF"/gi, 'stroke="var(--theme-background)"'],
      ];

      let out = raw;
      for (const [pattern, replacement] of replacements) {
        out = out.replace(pattern, replacement);
      }
      return out;
    };

    const setResponsiveSizing = (raw: string): string => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(raw, "image/svg+xml");
      const svg = doc.documentElement;

      // Always remove fixed dimensions from the root <svg>
      svg.removeAttribute("width");
      svg.removeAttribute("height");

      if (width || height) {
        // If explicit dimensions are provided, set them as attributes
        if (width) svg.setAttribute("width", String(width));
        if (height) svg.setAttribute("height", String(height));
        // Do not force responsive style if explicit sizing is used
      } else {
        // Make the SVG scale with its container while preserving aspect ratio
        const existingStyle = svg.getAttribute("style") || "";
        const responsiveStyle = "width:100%;height:auto;display:block;";
        const mergedStyle = `${existingStyle} ${responsiveStyle}`.trim();
        svg.setAttribute("style", mergedStyle);
        // Ensure preserveAspectRatio is present for proper scaling
        if (!svg.getAttribute("preserveAspectRatio")) {
          svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        }
      }

      return svg.outerHTML;
    };

    (async () => {
      try {
        const res = await fetch("/collage-illustration.svg", {
          cache: "force-cache",
        });
        const raw = await res.text();
        let processed = remapColors(raw);
        processed = setResponsiveSizing(processed);
        if (isMounted) setSvgHtml(processed);
      } catch {
        // Ignore fetch errors in UI component
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [width, height]);

  return (
    <div
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}
