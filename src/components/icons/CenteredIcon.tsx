import React from "react";

type IconProps = {
  className?: string;
  size?: number;
  height?: number;
};

export const CenteredIcon: React.FC<IconProps> = ({
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
      <rect x="6" y="6" width="16" height="16" rx="2" fill="currentColor" />
      <rect x="1" y="1" width="6" height="5" rx="1" fill="currentColor" />
      <rect x="21" y="22" width="6" height="5" rx="1" fill="currentColor" />
      <rect x="21" y="1" width="6" height="5" rx="1" fill="currentColor" />
      <rect x="1" y="22" width="6" height="5" rx="1" fill="currentColor" />
    </svg>
  );
};

export default CenteredIcon;
