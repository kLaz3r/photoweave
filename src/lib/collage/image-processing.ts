/**
 * Load an image from a File, applying EXIF orientation via createImageBitmap.
 * For Safari <17 or when the file is TIFF/raw, falls back to canvas + exifr.
 */
export async function loadImageFromFile(file: File): Promise<ImageBitmap> {
  // createImageBitmap handles EXIF orientation natively in modern browsers
  const bitmap = await createImageBitmap(file);
  return bitmap;
}

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
): HTMLCanvasElement | OffscreenCanvas {
  const srcW = source.width;
  const srcH = source.height;

  // Use OffscreenCanvas in workers, HTMLCanvasElement on main thread
  const isWorker = typeof document === "undefined";
  const canvas = isWorker
    ? new OffscreenCanvas(Math.max(1, targetW), Math.max(1, targetH))
    : document.createElement("canvas");
  canvas.width = Math.max(1, targetW);
  canvas.height = Math.max(1, targetH);
  const ctx = canvas.getContext("2d")! as CanvasRenderingContext2D;

  if (!maintainAspect) {
    ctx.drawImage(source, 0, 0, targetW, targetH);
    return canvas;
  }

  // Scale to cover
  const scale = Math.max(targetW / srcW, targetH / srcH);
  const scaledW = Math.max(1, Math.round(srcW * scale));
  const scaledH = Math.max(1, Math.round(srcH * scale));

  // Draw scaled image
  const tmp = isWorker
    ? new OffscreenCanvas(scaledW, scaledH)
    : document.createElement("canvas");
  tmp.width = scaledW;
  tmp.height = scaledH;
  const tmpCtx = tmp.getContext("2d")! as CanvasRenderingContext2D;
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
export function trimBorders(
  canvas: HTMLCanvasElement | OffscreenCanvas,
): { left: number; top: number; right: number; bottom: number } {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })! as CanvasRenderingContext2D;
  const w = canvas.width;
  const h = canvas.height;

  // Get all pixels
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Compute per-row and per-column mean luminance
  // data layout: RGBA RGBA RGBA ... row-major
  const rowMean = new Float32Array(h);
  const colMean = new Float32Array(w);

  for (let y = 0; y < h; y++) {
    let sum = 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const lum = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
      sum += lum;
      colMean[x] = (colMean[x] ?? 0) + lum;
    }
    rowMean[y] = sum / w;
  }

  for (let x = 0; x < w; x++) {
    colMean[x] = (colMean[x] ?? 0) / h;
  }

  // Standard deviation helper
  function rowStdDev(startY: number, endY: number): number {
    let sum = 0;
    for (let y = startY; y < endY; y++) sum += rowMean[y]!;
    const mean = sum / (endY - startY);
    let varSum = 0;
    for (let y = startY; y < endY; y++) {
      const d = rowMean[y]! - mean;
      varSum += d * d;
    }
    return Math.sqrt(varSum / (endY - startY));
  }

  function colStdDev(startX: number, endX: number): number {
    let sum = 0;
    for (let x = startX; x < endX; x++) sum += colMean[x]!;
    const mean = sum / (endX - startX);
    let varSum = 0;
    for (let x = startX; x < endX; x++) {
      const d = colMean[x]! - mean;
      varSum += d * d;
    }
    return Math.sqrt(varSum / (endX - startX));
  }

  const MIN_FRAC = 0.04; // same as Python min_frac

  // Scan top border
  let top = 0;
  outerTop: for (; top < Math.floor(h * (1 - MIN_FRAC)); top++) {
    const std = rowStdDev(top, top + 1);
    const mean = rowMean[top]!;
    if (std >= 2.0 || mean < 16 || mean > 239) break outerTop;
  }

  // Scan bottom border
  let bottom = h;
  outerBottom: for (; bottom > Math.ceil(h * MIN_FRAC); bottom--) {
    const std = rowStdDev(bottom - 1, bottom);
    const mean = rowMean[bottom - 1]!;
    if (std >= 2.0 || mean < 16 || mean > 239) break outerBottom;
  }

  // Scan left border
  let left = 0;
  outerLeft: for (; left < Math.floor(w * (1 - MIN_FRAC)); left++) {
    const std = colStdDev(left, left + 1);
    const mean = colMean[left]!;
    if (std >= 2.0 || mean < 16 || mean > 239) break outerLeft;
  }

  // Scan right border
  let right = w;
  outerRight: for (; right > Math.ceil(w * MIN_FRAC); right--) {
    const std = colStdDev(right - 1, right);
    const mean = colMean[right - 1]!;
    if (std >= 2.0 || mean < 16 || mean > 239) break outerRight;
  }

  return { left, top, right, bottom };
}