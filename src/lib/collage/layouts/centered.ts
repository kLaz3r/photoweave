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

export function centeredPack(
  canvasWidth: number,
  canvasHeight: number,
  spacingPercent: number,
  images: ImageInfo[],
): ImageBlock[] {
  if (!images.length) return [];

  const spacingPx = spacingPxFn(canvasWidth, canvasHeight, spacingPercent);
  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;

  const isLandscape = canvasWidth > canvasHeight;
  const heroRatio = 0.4;
  let heroW: number;
  let heroH: number;

  if (isLandscape) {
    heroW = canvasWidth * heroRatio;
    heroH = heroW / (images[0]!.aspect || 4 / 3);
  } else {
    heroH = canvasHeight * heroRatio;
    heroW = heroH * (images[0]!.aspect || 3 / 4);
  }

  const maxHeroDim = Math.min(canvasWidth * 0.45, canvasHeight * 0.45);
  if (heroW > maxHeroDim || heroH > maxHeroDim) {
    const scale = Math.min(maxHeroDim / heroW, maxHeroDim / heroH);
    heroW *= scale;
    heroH *= scale;
  }

  const blocks: ImageBlock[] = [];

  blocks.push({
    x: Math.round(cx - heroW / 2),
    y: Math.round(cy - heroH / 2),
    width: Math.round(heroW),
    height: Math.round(heroH),
    imageIndex: 0,
  });

  const remaining = images.length - 1;
  if (remaining <= 0) return blocks;

  const ringCount = Math.min(3, Math.ceil(remaining / 4));
  const photosPerRing = Math.ceil(remaining / ringCount);

  const heroMax = Math.max(heroW, heroH);
  const minSpacing = heroMax * 0.15 + spacingPx * 2;
  const maxRadius = Math.min(canvasWidth, canvasHeight) / 2 - minSpacing;

  let photoIndex = 1;

  for (let ring = 0; ring < ringCount; ring++) {
    const actualCount = Math.min(
      photosPerRing,
      remaining - (photoIndex - 1),
    );

    const ringRadius =
      heroMax * 0.55 +
      ((maxRadius - heroMax * 0.55) * (ring + 1)) / ringCount;

    const sizeDecay = 1.0 - (ring / ringCount) * 0.5;
    const sideLength = heroMax * 0.35 * sizeDecay;

    for (let j = 0; j < actualCount; j++) {
      const angle = (j / actualCount) * Math.PI * 2 + ring * 0.5;
      const img = images[photoIndex];
      const ratio = img?.aspect ?? 1;

      let w: number;
      let h: number;
      if (ratio >= 1) {
        w = sideLength;
        h = sideLength / ratio;
      } else {
        h = sideLength;
        w = sideLength * ratio;
      }

      const px = cx + Math.cos(angle) * ringRadius - w / 2;
      const py = cy + Math.sin(angle) * ringRadius - h / 2;

      if (
        px >= spacingPx &&
        py >= spacingPx &&
        px + w <= canvasWidth - spacingPx &&
        py + h <= canvasHeight - spacingPx
      ) {
        blocks.push({
          x: Math.round(px),
          y: Math.round(py),
          width: Math.round(w),
          height: Math.round(h),
          imageIndex: photoIndex,
        });
      }

      photoIndex++;
      if (photoIndex >= images.length) break;
    }

    if (photoIndex >= images.length) break;
  }

  for (let i = photoIndex; i < images.length; i++) {
    const size = heroMax * 0.18;
    const img = images[i];
    const ratio = img?.aspect ?? 1;
    let w: number;
    let h: number;
    if (ratio >= 1) {
      w = size;
      h = size / ratio;
    } else {
      h = size;
      w = size * ratio;
    }

    const angle = Math.random() * Math.PI * 2;
    const r = maxRadius * (0.6 + Math.random() * 0.4);
    const px = cx + Math.cos(angle) * r - w / 2;
    const py = cy + Math.sin(angle) * r - h / 2;

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
