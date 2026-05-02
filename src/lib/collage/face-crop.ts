/**
 * Face-aware smart crop. Port of Python _smart_face_crop (lines 1451–1565).
 */

export interface FaceDetection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  score: number;
}

/**
 * Returns an HTMLCanvasElement cropped to targetW×targetH,
 * with the detected faces well-centered. Returns null if no
 * face data provided or crop is impossible.
 */
export function smartFaceCrop(
  source: HTMLCanvasElement | ImageBitmap | OffscreenCanvas,
  faces: FaceDetection[],
  targetW: number,
  targetH: number,
): HTMLCanvasElement | OffscreenCanvas | null {
  if (!faces.length) return null;

  const srcW = source.width;
  const srcH = source.height;
  if (srcW === 0 || srcH === 0) return null;

  // Use OffscreenCanvas in workers, HTMLCanvasElement on main thread
  const isWorker = typeof document === "undefined";
  const result = isWorker
    ? new OffscreenCanvas(Math.max(1, targetW), Math.max(1, targetH))
    : document.createElement("canvas");
  result.width = Math.max(1, targetW);
  result.height = Math.max(1, targetH);
  const ctx = result.getContext("2d")! as CanvasRenderingContext2D;

  let cropLeft = 0;
  let cropTop = 0;

  if (faces.length === 1) {
    // Single face: center on face
    const { x1, y1, x2, y2 } = faces[0]!;
    const faceCenterX = (x1 + x2) / 2;
    const faceCenterY = (y1 + y2) / 2;

    cropLeft = Math.max(0, faceCenterX - targetW / 2);
    cropTop = Math.max(0, faceCenterY - targetH / 2);

    // Clamp to image bounds
    if (cropLeft + targetW > srcW) {
      cropLeft = Math.max(0, srcW - targetW);
    }
    if (cropTop + targetH > srcH) {
      cropTop = Math.max(0, srcH - targetH);
    }
  } else {
    // Multiple faces: bounding box of all faces + padding
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const f of faces) {
      if (f.x1 < minX) minX = f.x1;
      if (f.y1 < minY) minY = f.y1;
      if (f.x2 > maxX) maxX = f.x2;
      if (f.y2 > maxY) maxY = f.y2;
    }

    const faceAreaW = maxX - minX;
    const faceAreaH = maxY - minY;
    const padX = Math.max(faceAreaW * 0.2, targetW * 0.1);
    const padY = Math.max(faceAreaH * 0.2, targetH * 0.1);

    let curLeft = Math.max(0, minX - padX);
    let curTop = Math.max(0, minY - padY);
    let curRight = Math.min(srcW, maxX + padX);
    let curBottom = Math.min(srcH, maxY + padY);

    let curW = curRight - curLeft;
    let curH = curBottom - curTop;

    // Expand to target aspect if needed
    const targetAspect = targetW / targetH;
    if (curW / curH > targetAspect) {
      // Too wide, expand height or crop width
      const newH = curW / targetAspect;
      if (newH <= srcH) {
        const dy = Math.max(0, (newH - curH) / 2);
        curTop = Math.max(0, curTop - dy);
        curBottom = Math.min(srcH, curTop + newH);
        curW = curRight - curLeft;
        curH = curBottom - curTop;
      } else {
        const newW = curH * targetAspect;
        curLeft = Math.max(0, curLeft + (curW - newW) / 2);
        curRight = curLeft + newW;
        curW = curRight - curLeft;
      }
    } else {
      // Too tall, expand width or crop height
      const newW = curH * targetAspect;
      if (newW <= srcW) {
        const dx = Math.max(0, (newW - curW) / 2);
        curLeft = Math.max(0, curLeft - dx);
        curRight = Math.min(srcW, curLeft + newW);
        curW = curRight - curLeft;
        curH = curBottom - curTop;
      } else {
        curTop = Math.max(0, curTop + (curH - curW / targetAspect) / 2);
        curBottom = curTop + curW / targetAspect;
        curH = curBottom - curTop;
      }
    }

    cropLeft = Math.max(0, Math.min(curLeft, srcW - targetW));
    cropTop = Math.max(0, Math.min(curTop, srcH - targetH));
  }

  // Clamp to valid bounds
  cropLeft = Math.max(0, Math.min(cropLeft, srcW - targetW));
  cropTop = Math.max(0, Math.min(cropTop, srcH - targetH));

  ctx.drawImage(
    source,
    cropLeft,
    cropTop,
    Math.min(targetW, srcW - cropLeft),
    Math.min(targetH, srcH - cropTop),
    0,
    0,
    targetW,
    targetH,
  );

  return result;
}