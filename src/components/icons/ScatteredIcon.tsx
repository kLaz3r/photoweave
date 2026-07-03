import React from "react";

type IconProps = {
  className?: string;
  size?: number;
  height?: number;
};

export const ScatteredIcon: React.FC<IconProps> = ({
  className = "",
  size,
  height,
}) => {
  const finalHeight = height ?? size ?? 28;
  const finalWidth = finalHeight;
  return (
    <svg
      width={finalWidth}
      height={finalHeight}
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
      className={className}
    >
      <rect x="1" y="1" width="10" height="8" rx="1.5" fill="currentColor" />
      <rect x="14" y="3" width="13" height="6" rx="1.5" fill="currentColor" />
      <rect x="3" y="19" width="8" height="8" rx="1.5" fill="currentColor" />
      <rect x="18" y="12" width="9" height="7" rx="1.5" fill="currentColor" />
      <rect x="1" y="12" width="6" height="5" rx="1.5" fill="currentColor" />
    </svg>
  );
};

export default ScatteredIcon;
