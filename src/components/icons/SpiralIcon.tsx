import React from "react";

type IconProps = {
  className?: string;
  size?: number;
  height?: number;
};

export const SpiralIcon: React.FC<IconProps> = ({
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
      <path
        d="M14 14
          Q14 10 11 8.5
          Q7 6.5 7 10
          Q7 14 11 16
          Q16 18.5 18 22
          Q20 26 16 26
          Q11 26 9 22
          Q7 17 10 13
          Q14 8 19 8
          Q23 8 24 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default SpiralIcon;
