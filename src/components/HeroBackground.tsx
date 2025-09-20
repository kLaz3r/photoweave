import React from "react";

interface HeroBackgroundProps {
  /** Blur amount for the background layers */
  blur?: number;
  /** Width of the SVG viewBox */
  width?: number;
  /** Height of the SVG viewBox */
  height?: number;
  /** Opacity of the background (0-1) */
  opacity?: number;
  /** Additional CSS classes */
  className?: string;
}

const HeroBackground: React.FC<HeroBackgroundProps> = ({
  blur = 0,
  width = 960,
  height = 540,
  opacity = 0.25,
  className = "",
}) => {
  return (
    <div
      className={`absolute inset-0 -z-10 ${className}`}
      style={{
        filter: blur > 0 ? `blur(${blur}px)` : "none",
        opacity: opacity,
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        version="1.1"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        {/* Background rectangle */}
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="var(--theme-background)"
        />

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="grad1_0" x1="43.8%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="14.444444444444446%"
              stopColor="var(--theme-background)"
              stopOpacity="1"
            />
            <stop
              offset="85.55555555555554%"
              stopColor="var(--theme-background)"
              stopOpacity="1"
            />
          </linearGradient>

          <linearGradient id="grad2_0" x1="0%" y1="0%" x2="56.3%" y2="100%">
            <stop
              offset="14.444444444444446%"
              stopColor="var(--theme-background)"
              stopOpacity="1"
            />
            <stop
              offset="85.55555555555554%"
              stopColor="var(--theme-background)"
              stopOpacity="1"
            />
          </linearGradient>
        </defs>

        {/* Top-right accent shape */}
        <g transform={`translate(${width}, 0)`}>
          <path
            d="M0 378C-33.2 355 -66.4 331.9 -105.1 323.4C-143.7 314.8 -187.7 320.7 -222.2 305.8C-256.7 290.9 -281.6 255.1 -303.4 220.4C-325.2 185.7 -343.8 152.1 -355.7 115.6C-367.6 79 -372.8 39.5 -378 0L0 0Z"
            fill="var(--theme-secondary)"
          />
        </g>

        {/* Bottom-left accent shape */}
        <g transform={`translate(0, ${height})`}>
          <path
            d="M0 -378C38.2 -363.6 76.4 -349.2 107.2 -330C138.1 -310.8 161.6 -286.8 196.9 -271C232.3 -255.3 279.5 -247.9 305.8 -222.2C332.2 -196.5 337.6 -152.6 346.2 -112.5C354.7 -72.4 366.4 -36.2 378 0L0 0Z"
            fill="var(--theme-secondary)"
          />
        </g>
      </svg>
    </div>
  );
};

export default HeroBackground;
