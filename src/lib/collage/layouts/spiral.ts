import type { ImageBlock } from "../config";

function spacingPxFn(
  canvasWidth: number,
  canvasHeight: number,
  spacingPercent: number,
): number {
  return Math.round(
    Math.min(canvasWidth, canvasHeight) * (spacingPercent / 100) * 0.05,
  );
}

interface ImageInfo {
  width: number;
  height: number;
  aspect: number;
}

export function spiralPack(
  canvasWidth: number,
  canvasHeight: number,
  spacingPercent: number,
  images: ImageInfo[],
): ImageBlock[] {
  if (!images.length) return [];

  const spacingPx = spacingPxFn(canvasWidth, canvasHeight, spacingPercent);
  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;
  const maxRadius = Math.min(canvasWidth, canvasHeight) / 2 - spacingPx * 3;

  const totalPhotos = images.length;
  const totalAngle = (totalPhotos - 1) * 0.8;

  const blocks: ImageBlock[] = [];

  for (let i = 0; i < images.length; i++) {
    const t = images.length === 1 ? 0 : i / (images.length - 1);
    const angle = t * totalAngle;
    const radius = maxRadius * (0.05 + t * 0.9);

    const sizeFactor = 0.9 - t * 0.3;
    const baseSize = Math.min(canvasWidth, canvasHeight) * 0.12 * sizeFactor;

    const img = images[i]!;
    let w: number;
    let h: number;
    if (img.aspect >= 1) {
      w = baseSize;
      h = baseSize / img.aspect;
    } else {
      h = baseSize;
      w = baseSize * img.aspect;
    }

    const px = cx + Math.cos(angle) * radius - w / 2;
    const py = cy + Math.sin(angle) * radius - h / 2;

    blocks.push({
      x: Math.round(Math.max(spacingPx, Math.min(canvasWidth - w - spacingPx, px))),
      y: Math.round(Math.max(spacingPx, Math.min(canvasHeight - h - spacingPx, py))),
      width: Math.round(w),
      height: Math.round(h),
      imageIndex: i,
    });
  }

  return blocks;
}
