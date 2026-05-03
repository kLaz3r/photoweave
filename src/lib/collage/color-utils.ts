export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Parse #RRGGBB or #RRGGBBAA into {r,g,b,a}.
 * Defaults alpha to 255 if not provided.
 */
export function parseColorRGBA(hex: string): RGBA {
  if (!hex.startsWith("#")) return { r: 255, g: 255, b: 255, a: 255 };
  const str = hex.slice(1);
  if (str.length === 8) {
    return {
      r: parseInt(str.slice(0, 2), 16),
      g: parseInt(str.slice(2, 4), 16),
      b: parseInt(str.slice(4, 6), 16),
      a: parseInt(str.slice(6, 8), 16),
    };
  }
  if (str.length === 6) {
    return {
      r: parseInt(str.slice(0, 2), 16),
      g: parseInt(str.slice(2, 4), 16),
      b: parseInt(str.slice(4, 6), 16),
      a: 255,
    };
  }
  return { r: 255, g: 255, b: 255, a: 255 };
}

/**
 * Returns true if the color string has a non-fully-opaque alpha channel.
 */
export function colorHasAlpha(hex: string): boolean {
  return parseColorRGBA(hex).a < 255;
}
