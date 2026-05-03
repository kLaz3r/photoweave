/**
 * Main-thread bridge to the collage Web Worker.
 * Falls back to main-thread execution when OffscreenCanvas is unavailable.
 * Note: ImageBitmaps are copied (not transferred) to preserve them for preview.
 */
import type { CollageConfig, LoadedImage } from "./config";
import { generateCollage } from "./collage-generator";

/** Load and return a new Worker instance. */
function createWorker(): Worker | null {
  try {
    return new Worker(new URL("./collage-worker.ts", import.meta.url), {
      type: "module",
    });
  } catch {
    return null;
  }
}

/**
 * Generate a collage using a Web Worker when available.
 * Falls back to synchronous main-thread execution.
 */
export function generateCollageWithWorker(
  images: LoadedImage[],
  config: CollageConfig,
  onProgress?: (pct: number) => void,
): Promise<ImageBitmap> {
  return new Promise((resolve, reject) => {
    // Check for OffscreenCanvas support
    if (typeof OffscreenCanvas === "undefined") {
      // Fallback: run on main thread
      void generateCollage(images, config, onProgress)
        .then((canvas) => createImageBitmap(canvas))
        .then(resolve)
        .catch(reject);
      return;
    }

    const worker = createWorker();
    if (!worker) {
      // Worker creation failed — fallback to main thread
      void generateCollage(images, config, onProgress)
        .then((canvas) => createImageBitmap(canvas))
        .then(resolve)
        .catch(reject);
      return;
    }

    worker.onmessage = (
      e: MessageEvent<{
        type?: string;
        percent?: number;
        imageBitmap?: ImageBitmap;
        message?: string;
      }>,
    ) => {
      const { type, percent, imageBitmap, message } = e.data ?? {};
      if (type === "progress") {
        onProgress?.(typeof percent === "number" ? percent : 0);
      } else if (type === "done" && imageBitmap) {
        resolve(imageBitmap);
        worker.terminate();
      } else if (type === "error") {
        reject(
          new Error(typeof message === "string" ? message : "Worker error"),
        );
        worker.terminate();
      }
    };

    worker.onerror = (err: ErrorEvent) => {
      reject(new Error(err.message));
      worker.terminate();
    };

    // Send images to worker (bitmaps are copied, not transferred)
    // We can't transfer because bitmaps are still needed in main thread for preview
    // Disable face detection in worker since MediaPipe doesn't support worker context
    const workerConfig = {
      ...config,
      faceAwareCropping: false,
      debugFaces: false,
    };
    worker.postMessage({ images, config: workerConfig });
  });
}

/**
 * Download a canvas as a file.
 */
export async function downloadCanvas(
  canvas: HTMLCanvasElement,
  format: "jpeg" | "png",
  filename: string,
): Promise<void> {
  const dataUrl = canvas.toDataURL(
    format === "png" ? "image/png" : "image/jpeg",
    format === "jpeg" ? 0.95 : undefined,
  );

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
