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

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  pad: number,
): boolean {
  return !(
    a.x + a.w + pad <= b.x ||
    b.x + b.w + pad <= a.x ||
    a.y + a.h + pad <= b.y ||
    b.y + b.h + pad <= a.y
  );
}

export function scatteredPack(
  canvasWidth: number,
  canvasHeight: number,
  spacingPercent: number,
  images: ImageInfo[],
): ImageBlock[] {
  if (!images.length) return [];

  const spacingPx = spacingPxFn(canvasWidth, canvasHeight, spacingPercent);
  const margin = spacingPx * 2;

  const canvasArea = canvasWidth * canvasHeight;
  const avgSize = Math.min(
    canvasWidth * 0.35,
    canvasHeight * 0.35,
    Math.sqrt(canvasArea / images.length) * 1.6,
  );

  interface Placed {
    x: number;
    y: number;
    w: number;
    h: number;
  }

  const placed: Placed[] = [];
  const blocks: ImageBlock[] = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i]!;
    let w: number;
    let h: number;

    if (img.aspect >= 1) {
      w = avgSize;
      h = avgSize / img.aspect;
    } else {
      h = avgSize;
      w = avgSize * img.aspect;
    }

    const maxTries = 200;
    let bestX = margin;
    let bestY = margin;
    let bestOverlap = Infinity;
    let foundSpot = false;

    for (let t = 0; t < maxTries; t++) {
      const candidateX =
        margin + Math.random() * (canvasWidth - w - margin * 2);
      const candidateY =
        margin + Math.random() * (canvasHeight - h - margin * 2);

      let overlapCount = 0;

      for (const p of placed) {
        if (
          rectsOverlap(
            { x: candidateX, y: candidateY, w, h },
            { x: p.x, y: p.y, w: p.w, h: p.h },
            spacingPx,
          )
        ) {
          overlapCount++;
        }
      }

      if (overlapCount === 0) {
        bestX = candidateX;
        bestY = candidateY;
        bestOverlap = 0;
        foundSpot = true;
        break;
      }

      if (overlapCount < bestOverlap) {
        bestOverlap = overlapCount;
        bestX = candidateX;
        bestY = candidateY;
      }
    }

    if (foundSpot) {
      placed.push({ x: bestX, y: bestY, w, h });
      blocks.push({
        x: Math.round(bestX),
        y: Math.round(bestY),
        width: Math.round(w),
        height: Math.round(h),
        imageIndex: i,
      });
    }
  }

  return blocks;
}
