/**
 * Smart resize — scale-to-cover + optional center crop.
 * Matches Python _smart_resize (lines 927–964).
 * Works with both HTMLCanvasElement (main thread) and OffscreenCanvas (worker).
 */
export function smartResize(
  source: ImageBitmap | HTMLCanvasElement | OffscreenCanvas,
  targetW: number,
  targetH: number,
  maintainAspect: boolean,
): OffscreenCanvas {
  const srcW = source.width;
  const srcH = source.height;

  const canvas = new OffscreenCanvas(Math.max(1, targetW), Math.max(1, targetH));
  canvas.width = Math.max(1, targetW);
  canvas.height = Math.max(1, targetH);
  const ctx = canvas.getContext("2d")!;

  if (!maintainAspect) {
    ctx.drawImage(source, 0, 0, targetW, targetH);
    return canvas;
  }

  // Scale to cover
  const scale = Math.max(targetW / srcW, targetH / srcH);
  const scaledW = Math.max(1, Math.round(srcW * scale));
  const scaledH = Math.max(1, Math.round(srcH * scale));

  // Draw scaled image
  const tmp = new OffscreenCanvas(scaledW, scaledH);
  tmp.width = scaledW;
  tmp.height = scaledH;
  const tmpCtx = tmp.getContext("2d")!;
  tmpCtx.drawImage(source, 0, 0, scaledW, scaledH);

  // Center crop
  const left = Math.max(0, Math.round((scaledW - targetW) / 2));
  const top = Math.max(0, Math.round((scaledH - targetH) / 2));

  ctx.drawImage(
    tmp,
    left,
    top,
    Math.min(targetW, tmp.width - left),
    Math.min(targetH, tmp.height - top),
    0,
    0,
    targetW,
    targetH,
  );

  return canvas;
}

/**
 * Detect and trim borders from a canvas — e.g., black bars in screenshots.
 * Port of Python _trim_borders (lines 1592–1662).
 * Works with both HTMLCanvasElement and OffscreenCanvas.
 *
 * Returns crop bounds: { left, top, right, bottom } in pixel coordinates.
 */
export function trimBorders(canvas: HTMLCanvasElement | OffscreenCanvas): {
  left: number;
  top: number;
  right: number;
  bottom: number;
} {
  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  })! as CanvasRenderingContext2D;
  const w = canvas.width;
  const h = canvas.height;

  // Get all pixels
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Compute per-row and per-column luminance mean + pixel-level std dev
  // data layout: RGBA RGBA RGBA ... row-major
  const rowMean = new Float32Array(h);
  const rowStd = new Float32Array(h);
  const colMean = new Float32Array(w);
  const colSumSq = new Float32Array(w);

  for (let y = 0; y < h; y++) {
    let rowSum = 0;
    let rowSumSq = 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const lum =
        0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
      rowSum += lum;
      rowSumSq += lum * lum;
      colMean[x] = (colMean[x] ?? 0) + lum;
      colSumSq[x] = (colSumSq[x] ?? 0) + lum * lum;
    }
    rowMean[y] = rowSum / w;
    const rowMsq = rowSumSq / w;
    const rowM = rowMean[y]!;
    rowStd[y] = Math.sqrt(Math.max(0, rowMsq - rowM * rowM));
  }

  const colStd = new Float32Array(w);
  for (let x = 0; x < w; x++) {
    colMean[x] = colMean[x]! / h;
    const colMsq = colSumSq[x]! / h;
    const colM = colMean[x]!;
    colStd[x] = Math.sqrt(Math.max(0, colMsq - colM * colM));
  }

  const MIN_FRAC = 0.04; // same as Python min_frac

  // Scan top border
  let top = 0;
  for (; top < Math.floor(h * (1 - MIN_FRAC)); top++) {
    const std = rowStd[top]!;
    const mean = rowMean[top]!;
    if (std >= 2.0 || mean < 16 || mean > 239) break;
  }

  // Scan bottom border
  let bottom = h;
  for (; bottom > Math.ceil(h * MIN_FRAC); bottom--) {
    const std = rowStd[bottom - 1]!;
    const mean = rowMean[bottom - 1]!;
    if (std >= 2.0 || mean < 16 || mean > 239) break;
  }

  // Scan left border
  let left = 0;
  for (; left < Math.floor(w * (1 - MIN_FRAC)); left++) {
    const std = colStd[left]!;
    const mean = colMean[left]!;
    if (std >= 2.0 || mean < 16 || mean > 239) break;
  }

  // Scan right border
  let right = w;
  for (; right > Math.ceil(w * MIN_FRAC); right--) {
    const std = colStd[right - 1]!;
    const mean = colMean[right - 1]!;
    if (std >= 2.0 || mean < 16 || mean > 239) break;
  }

  return { left, top, right, bottom };
}
