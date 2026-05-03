export type LayoutStyle = "masonry" | "grid";
export type OutputFormat = "jpeg" | "png";
export type DimensionMode = "px" | "mm";

export interface CollageConfig {
  widthPx: number; // default 1920, range 320–20000
  heightPx: number; // default 1080, range 320–20000
  widthMm: number; // default 304.8, range 50–1219.2
  heightMm: number; // default 457.2, range 50–1219.2
  dpi: number; // default 96, range 72–300
  dimensionMode: DimensionMode;
  layoutStyle: LayoutStyle;
  spacing: number; // 0–100, default 40
  backgroundColor: string; // #RRGGBB or #RRGGBBAA, default '#FFFFFF'
  maintainAspectRatio: boolean;
  applyShadow: boolean;
  outputFormat: OutputFormat;
  faceAwareCropping: boolean;
  faceMargin: number; // 0–0.3, default 0.08
  pretrimBorders: boolean;
  debugFaces: boolean;
}

export interface ImageBlock {
  x: number;
  y: number;
  width: number;
  height: number;
  imageIndex: number;
}

export interface LoadedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
  aspect: number;
  file: File;
}

export const DEFAULT_COLLAGE_CONFIG: CollageConfig = {
  widthPx: 1920,
  heightPx: 1080,
  widthMm: 304.8,
  heightMm: 457.2,
  dpi: 96,
  dimensionMode: "px",
  layoutStyle: "masonry",
  spacing: 40,
  backgroundColor: "#FFFFFF",
  maintainAspectRatio: true,
  applyShadow: false,
  outputFormat: "jpeg",
  faceAwareCropping: false,
  faceMargin: 0.08,
  pretrimBorders: false,
  debugFaces: false,
};
