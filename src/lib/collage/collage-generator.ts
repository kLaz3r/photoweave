/**
 * Main collage generation — runs in a Web Worker for non-blocking rendering.
 * Uses OffscreenCanvas (available in both main and worker threads).
 */
import type { CollageConfig, ImageBlock, LoadedImage } from "./config";
import type { FaceDetection } from "./face-detection";
import { parseColorRGBA, colorHasAlpha } from "./color-utils";
import { masonryPack } from "./layouts/masonry";
import { gridPack } from "./layouts/grid";
import { smartResize, trimBorders } from "./image-processing";
import { drawImageWithShadow, drawImageSimple } from "./shadow";
import { smartFaceCrop } from "./face-crop";

// Dynamic imports for face detection (not available in workers)
let _detectFaces:
  | ((canvas: HTMLCanvasElement | OffscreenCanvas) => Promise<FaceDetection[]>)
  | null = null;
let _mergeFaceDetections:
  | ((detections: FaceDetection[]) => FaceDetection[])
  | null = null;
let _applyFaceMargin:
  | ((
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      imgWidth: number,
      imgHeight: number,
      margin: number,
    ) => { x1: number; y1: number; x2: number; y2: number })
  | null = null;

async function loadFaceDetection() {
  if (_detectFaces) return;
  // Only load face detection on main thread (not in workers)
  if (typeof document === "undefined") return;
  const fd = await import("./face-detection");
  _detectFaces = fd.detectFaces;
  _mergeFaceDetections = fd.mergeFaceDetections;
  _applyFaceMargin = fd.applyFaceMargin;
}

/** Compute canvas pixel dimensions from config. */
function effectiveDimensions(config: CollageConfig): { w: number; h: number } {
  if (config.dimensionMode === "mm") {
    return {
      w: Math.round((config.widthMm / 25.4) * config.dpi),
      h: Math.round((config.heightMm / 25.4) * config.dpi),
    };
  }
  return { w: config.widthPx, h: config.heightPx };
}

/** Convert canvas dimensions for preview (max 500px on longest edge). */
function previewDimensions(w: number, h: number): { w: number; h: number } {
  const maxDim = 500;
  if (w <= maxDim && h <= maxDim) return { w, h };
  if (w > h) return { w: maxDim, h: Math.round((h / w) * maxDim) };
  return { w: Math.round((w / h) * maxDim), h: maxDim };
}

function spacingPixels(w: number, h: number, spacing: number): number {
  return Math.round(Math.min(w, h) * (spacing / 100) * 0.05);
}

// ─── Worker-safe canvas creation ───────────────────────────────────────────
// OffscreenCanvas is available in both main thread and workers.
// Falls back to document.createElement only for preview (main thread only).
function makeCanvas(
  w: number,
  h: number,
  isPreview: boolean,
): HTMLCanvasElement | OffscreenCanvas {
  if (isPreview && typeof document !== "undefined") {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }
  return new OffscreenCanvas(w, h);
}

// ─── Face detection (worker-safe: uses offscreen canvas) ────────────────────

async function getOrDetectFaces(
  img: ImageBitmap,
  canvasSource: HTMLCanvasElement | OffscreenCanvas,
  config: CollageConfig,
  imageIndex: number,
): Promise<FaceDetection[]> {
  if (!config.faceAwareCropping && !config.debugFaces) return [];

  if (_faceCache.has(imageIndex)) return _faceCache.get(imageIndex)!;

  // Load face detection module (only on main thread)
  await loadFaceDetection();
  if (!_detectFaces || !_mergeFaceDetections || !_applyFaceMargin) {
    return [];
  }

  // Downscale source to max 1600px for fast face detection
  const MAX_DETECTION = 1600;
  const maxSrc = Math.max(img.width, img.height);
  const scale = maxSrc > MAX_DETECTION ? MAX_DETECTION / maxSrc : 1;

  let faceCanvas: HTMLCanvasElement | OffscreenCanvas;
  if (scale < 1) {
    faceCanvas = new OffscreenCanvas(
      Math.round(img.width * scale),
      Math.round(img.height * scale),
    );
    const fctx = faceCanvas.getContext("2d")!;
    fctx.drawImage(img, 0, 0, faceCanvas.width, faceCanvas.height);
  } else {
    faceCanvas = canvasSource;
  }

  let faces = await _detectFaces(faceCanvas);

  // Scale coordinates to original dimensions
  if (scale < 1) {
    faces = faces.map((f) => ({
      ...f,
      x1: f.x1 / scale,
      y1: f.y1 / scale,
      x2: f.x2 / scale,
      y2: f.y2 / scale,
    }));
  }

  // Apply face margins
  faces = faces.map((f) => {
    const m = _applyFaceMargin!(
      f.x1,
      f.y1,
      f.x2,
      f.y2,
      img.width,
      img.height,
      config.faceMargin,
    );
    return { ...f, ...m };
  });

  const merged = _mergeFaceDetections(faces);
  _faceCache.set(imageIndex, merged);
  return merged;
}

async function prerenderImage(
  img: LoadedImage,
  block: ImageBlock,
  config: CollageConfig,
  spacingPx: number,
  imageIndex: number,
  _isPreview: boolean,
): Promise<ImageBitmap> {
  let srcCanvas: HTMLCanvasElement | OffscreenCanvas;

  // Apply pre-trim borders
  if (config.pretrimBorders) {
    const raw = new OffscreenCanvas(img.width, img.height);
    const rctx = raw.getContext("2d")!;
    rctx.drawImage(img.bitmap, 0, 0);
    const { left, top, right, bottom } = trimBorders(raw);
    const newW = Math.max(1, right - left);
    const newH = Math.max(1, bottom - top);
    const trimmed = new OffscreenCanvas(newW, newH);
    const tctx = trimmed.getContext("2d")!;
    tctx.drawImage(raw, left, top, newW, newH, 0, 0, newW, newH);
    srcCanvas = trimmed;
  } else {
    srcCanvas = new OffscreenCanvas(img.width, img.height);
    const sc = srcCanvas.getContext("2d")!;
    sc.drawImage(img.bitmap, 0, 0);
  }

  // Detect faces for cropping
  const faces = await getOrDetectFaces(
    img.bitmap,
    srcCanvas,
    config,
    imageIndex,
  );

  // Resize to block dimensions
  let blockCanvas: HTMLCanvasElement | OffscreenCanvas;
  if (faces.length > 0 && config.faceAwareCropping) {
    const srcBitmap = await createImageBitmap(srcCanvas);
    const cropped = smartFaceCrop(srcBitmap, faces, block.width, block.height);
    blockCanvas =
      cropped ??
      smartResize(
        srcBitmap,
        block.width,
        block.height,
        config.maintainAspectRatio,
      );
  } else {
    const srcBitmap = await createImageBitmap(srcCanvas);
    blockCanvas = smartResize(
      srcBitmap,
      block.width,
      block.height,
      config.maintainAspectRatio,
    );
  }

  // Debug: draw face boxes
  if (config.debugFaces && faces.length > 0) {
    const dbg = new OffscreenCanvas(blockCanvas.width, blockCanvas.height);
    const dctx = dbg.getContext("2d")!;
    dctx.drawImage(blockCanvas, 0, 0);
    dctx.strokeStyle = "lime";
    dctx.lineWidth = 2;
    const scaleX = blockCanvas.width / img.width;
    const scaleY = blockCanvas.height / img.height;
    const sc = scaleX * (block.width / blockCanvas.width);
    const sy = scaleY * (block.height / blockCanvas.height);

    for (const f of faces) {
      const sx1 = f.x1 * sc;
      const sy1 = f.y1 * sy;
      const sw = (f.x2 - f.x1) * sc;
      const sh = (f.y2 - f.y1) * sy;

      dctx.strokeRect(sx1, sy1, sw, sh);
      dctx.fillStyle = "lime";
      dctx.font = `${Math.max(10, Math.round(sh * 0.3))}px monospace`;
      dctx.fillText(`${Math.round(f.score * 100)}%`, sx1, sy1 - 4);
    }
    return await createImageBitmap(dbg);
  }

  return await createImageBitmap(blockCanvas);
}

async function compositeCollage(
  images: LoadedImage[],
  config: CollageConfig,
  isPreview: boolean,
  onProgress?: (pct: number) => void,
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  const canvasDims = effectiveDimensions(config);
  const { w: canvasW, h: canvasH } = isPreview
    ? previewDimensions(canvasDims.w, canvasDims.h)
    : canvasDims;

  // Clamp canvas size
  const canvas = makeCanvas(
    Math.max(1, Math.min(20000, canvasW)),
    Math.max(1, Math.min(20000, canvasH)),
    isPreview,
  );

  // Fill background
  const rgba = parseColorRGBA(config.backgroundColor);
  const hasAlpha = colorHasAlpha(config.backgroundColor);
  const ctx = canvas.getContext("2d")! as CanvasRenderingContext2D;

  if (rgba.a === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    if (rgba.a < 255 || hasAlpha) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Compute layout
  const imageDims = images.map((img) => ({
    width: img.width,
    height: img.height,
    aspect: img.width / img.height,
  }));

  const blocks: ImageBlock[] =
    config.layoutStyle === "masonry"
      ? masonryPack(canvas.width, canvas.height, config.spacing, imageDims)
      : gridPack(canvas.width, canvas.height, config.spacing, imageDims);

  const spacingPx = spacingPixels(canvas.width, canvas.height, config.spacing);

  // Pre-load images if preview (downscale sources for speed)
  const scaledImages = isPreview
    ? await Promise.all(
        images.map(async (img) => {
          const MAX_PREVIEW = 1600;
          const maxDim = Math.max(img.width, img.height);
          if (maxDim <= MAX_PREVIEW) return img;
          const s = MAX_PREVIEW / maxDim;
          const scaled = new OffscreenCanvas(
            Math.round(img.width * s),
            Math.round(img.height * s),
          );
          const sc = scaled.getContext("2d")!;
          sc.drawImage(img.bitmap, 0, 0, scaled.width, scaled.height);
          const bitmap = await createImageBitmap(scaled);
          return {
            ...img,
            bitmap,
            width: scaled.width,
            height: scaled.height,
            aspect: scaled.width / scaled.height,
          };
        }),
      )
    : images;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    const srcImg = scaledImages[block.imageIndex] ?? scaledImages[0]!;

    onProgress?.(Math.round((i / blocks.length) * 90));

    // We need the ImageBitmap for compositing
    let imgBitmap: ImageBitmap;
    if (isPreview) {
      // For preview, use a quick center-crop resize (no face detection for speed)
      const resized = smartResize(
        srcImg.bitmap,
        block.width,
        block.height,
        config.maintainAspectRatio,
      );
      imgBitmap = await createImageBitmap(resized);
    } else {
      imgBitmap = await prerenderImage(
        srcImg,
        block,
        config,
        spacingPx,
        block.imageIndex,
        isPreview,
      );
    }

    if (config.applyShadow) {
      drawImageWithShadow(
        ctx,
        imgBitmap,
        block.x,
        block.y,
        block.width,
        block.height,
        spacingPx,
      );
    } else {
      drawImageSimple(
        ctx,
        imgBitmap,
        block.x,
        block.y,
        block.width,
        block.height,
      );
    }

    onProgress?.(Math.round(((i + 1) / blocks.length) * 100));
  }

  return canvas;
}

/**
 * Generate a collage. Works in both main thread and Web Worker.
 * Returns OffscreenCanvas when called from a worker, HTMLCanvasElement in main thread.
 */
export async function generateCollage(
  images: LoadedImage[],
  config: CollageConfig,
  onProgress?: (pct: number) => void,
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  _faceCache.clear();
  return compositeCollage(images, config, false, onProgress);
}

/**
 * Generate a low-res preview collage (max 500px on longest edge).
 * Always returns HTMLCanvasElement (runs on main thread).
 */
export async function generatePreview(
  images: LoadedImage[],
  config: CollageConfig,
  onProgress?: (pct: number) => void,
): Promise<HTMLCanvasElement> {
  const result = await compositeCollage(images, config, true, onProgress);
  // In preview mode, makeCanvas always returns HTMLCanvasElement
  return result as HTMLCanvasElement;
}

// Track face detections per image index to avoid re-detecting in preview mode
const _faceCache = new Map<number, FaceDetection[]>();
