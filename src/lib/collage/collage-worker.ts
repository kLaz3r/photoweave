/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
/**
 * Web Worker entry point — runs generateCollage off the main thread.
 * Uses OffscreenCanvas to allow 2D drawing without a DOM.
 */
import { generateCollage } from "./collage-generator";
import type { CollageConfig, LoadedImage } from "./config";

interface WorkerInput {
  images: LoadedImage[];
  config: CollageConfig;
}

self.onmessage = async (e: MessageEvent<WorkerInput>) => {
  const { images, config } = e.data;
  try {
    const canvas = await generateCollage(images, config, (pct) => {
      self.postMessage({ type: "progress", percent: pct });
    });

    // Transfer the rendered canvas as an ImageBitmap to avoid serialization cost
    const bitmap = await createImageBitmap(canvas);

    // postMessage(signal, { transfer }) form — transfer bitmaps zero-copy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(self as any).postMessage(
      { type: "done", imageBitmap: bitmap },
      { transfer: [bitmap] },
    );
  } catch (err) {
    self.postMessage({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
};