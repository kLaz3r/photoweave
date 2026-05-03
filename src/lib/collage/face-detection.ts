/**
 * Face detection using MediaPipe Tasks Vision (dynamically loaded, browser-only).
 * Replaces the Python 4-detector ensemble with a single WASM-based detector.
 */
export interface FaceDetection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  score: number;
}

interface DetectorResult {
  detections: Array<{
    boundingBox?: {
      originX?: number;
      originY?: number;
      width?: number;
      height?: number;
    };
    keypoints?: Array<{ score?: number }>;
    confidence?: number[];
  }>;
}

/** Load MediaPipe FaceDetector lazily. */
async function getDetector(): Promise<{
  detect(img: HTMLCanvasElement): DetectorResult;
}> {
  const cacheKey = "__photoweave_face_detector__";
  const win = window as unknown as Record<string, unknown>;
  if (win[cacheKey]) return win[cacheKey] as ReturnType<typeof getDetector>;

  const mpVision = await import(
    /* webpackIgnore: true */ "@mediapipe/tasks-vision"
  );

  const { FilesetResolver, FaceDetector: FDP } = mpVision;

  const fileset = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
  );

  const detector = await FDP.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
      delegate: "WASM" as "CPU",
    },
    runningMode: "IMAGE",
    minDetectionConfidence: 0.5,
  });

  win[cacheKey] = detector;
  return detector as unknown as {
    detect(img: HTMLCanvasElement): DetectorResult;
  };
}

/**
 * Detect faces in a canvas using MediaPipe WASM detector.
 * Works with both HTMLCanvasElement and OffscreenCanvas.
 * Note: Face detection is disabled in Web Workers due to MediaPipe limitations.
 */
export async function detectFaces(
  canvas: HTMLCanvasElement | OffscreenCanvas,
): Promise<FaceDetection[]> {
  // Skip on server-side rendering (not in browser or worker)
  if (typeof window === "undefined" && typeof self === "undefined") return [];

  // Skip in Web Workers - MediaPipe doesn't support worker context
  if (typeof document === "undefined") return [];

  try {
    const detector = await getDetector();
    const result = detector.detect(canvas as HTMLCanvasElement);

    return (result.detections ?? []).map((d) => ({
      x1: d.boundingBox?.originX ?? 0,
      y1: d.boundingBox?.originY ?? 0,
      x2: (d.boundingBox?.originX ?? 0) + (d.boundingBox?.width ?? 0),
      y2: (d.boundingBox?.originY ?? 0) + (d.boundingBox?.height ?? 0),
      score: d.keypoints?.[0]?.score ?? d.confidence?.[0] ?? 0.5,
    }));
  } catch {
    return [];
  }
}

/**
 * Merge overlapping face detections and remove duplicates.
 * Port of Python _merge_face_detections (lines 1412–1449).
 */
export function mergeFaceDetections(
  detections: FaceDetection[],
): FaceDetection[] {
  if (!detections.length) return [];

  const sorted = [...detections].sort((a, b) => b.score - a.score);
  const merged: FaceDetection[] = [];

  for (const det of sorted) {
    const { x1, y1, x2, y2 } = det;
    let isDuplicate = false;

    for (const existing of merged) {
      const ex1 = existing.x1;
      const ey1 = existing.y1;
      const ex2 = existing.x2;
      const ey2 = existing.y2;

      const ix1 = Math.max(x1, ex1);
      const iy1 = Math.max(y1, ey1);
      const ix2 = Math.min(x2, ex2);
      const iy2 = Math.min(y2, ey2);

      if (ix1 < ix2 && iy1 < iy2) {
        const intersectionArea = (ix2 - ix1) * (iy2 - iy1);
        const currentArea = (x2 - x1) * (y2 - y1);
        const existingArea = (ex2 - ex1) * (ey2 - ey1);

        if (intersectionArea > 0.3 * Math.min(currentArea, existingArea)) {
          isDuplicate = true;
          break;
        }
      }
    }

    if (!isDuplicate) merged.push(det);
  }

  return merged;
}

/**
 * Expand detection box by margin proportion on each side, clamped to image bounds.
 * Port of Python _apply_face_margin (lines 98–109).
 */
export function applyFaceMargin(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  imgWidth: number,
  imgHeight: number,
  margin: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const w = x2 - x1;
  const h = y2 - y1;
  const mx = w * margin;
  const my = h * margin;

  return {
    x1: Math.max(0, x1 - mx),
    y1: Math.max(0, y1 - my),
    x2: Math.min(imgWidth, x2 + mx),
    y2: Math.min(imgHeight, y2 + my),
  };
}
