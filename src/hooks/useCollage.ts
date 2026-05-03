/**
 * Main orchestration hook for the collage maker.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CollageConfig, LoadedImage } from "~/lib/collage/config";
import { DEFAULT_COLLAGE_CONFIG } from "~/lib/collage/config";
import { generatePreview } from "~/lib/collage/collage-generator";
import {
  generateCollageWithWorker,
  downloadCanvas,
} from "~/lib/collage/worker-bridge";
import {
  calculateOptimalGrid,
  type GridInfo,
} from "~/lib/collage/layouts/grid";

function calcCanvasPx(config: CollageConfig): { w: number; h: number } {
  if (config.dimensionMode === "mm") {
    return {
      w: Math.round((config.widthMm / 25.4) * config.dpi),
      h: Math.round((config.heightMm / 25.4) * config.dpi),
    };
  }
  return { w: config.widthPx, h: config.heightPx };
}

export function useCollage() {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [config, setConfig] = useState<CollageConfig>(DEFAULT_COLLAGE_CONFIG);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportBitmap, setExportBitmap] = useState<ImageBitmap | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive grid optimization info
  const [gridInfo, setGridInfo] = useState<GridInfo | null>(null);

  // Debounced preview generation (300ms)
  useEffect(() => {
    if (images.length < 2) {
      setPreviewCanvas(null);
      return;
    }
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);

    previewTimerRef.current = setTimeout(() => {
      void (async () => {
        try {
          const canvas = await generatePreview(images, config);
          setPreviewCanvas(canvas);
        } catch {
          // Silently ignore preview errors
        }
      })();
    }, 300);

    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [images, config]);

  // Update grid info when relevant params change
  useEffect(() => {
    if (config.layoutStyle !== "grid" || images.length < 2) {
      setGridInfo(null);
      return;
    }
    const { w, h } = calcCanvasPx(config);
    setGridInfo(calculateOptimalGrid(images.length, w, h, config.spacing));
  }, [images.length, config]);

  // Load images from File objects
  const addImages = useCallback(async (files: File[]) => {
    const newLoaded: LoadedImage[] = await Promise.all(
      files.map(async (file) => {
        const bitmap = await createImageBitmap(file);
        return {
          bitmap,
          width: bitmap.width,
          height: bitmap.height,
          aspect: bitmap.width / bitmap.height,
          file,
        };
      }),
    );
    setImages((prev) => [...prev, ...newLoaded]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed) removed.bitmap.close();
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const reorderImages = useCallback((from: number, to: number) => {
    setImages((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      if (moved !== undefined) arr.splice(to, 0, moved);
      return arr;
    });
  }, []);

  const shuffleImages = useCallback(() => {
    setImages((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = arr[i]!;
        arr[i] = arr[j]!;
        arr[j] = tmp;
      }
      return arr;
    });
  }, []);

  const sortImagesChronologically = useCallback(() => {
    setImages((prev) =>
      [...prev].sort((a, b) => b.file.lastModified - a.file.lastModified),
    );
  }, []);

  const clearImages = useCallback(() => {
    setImages((prev) => {
      prev.forEach((img) => img.bitmap.close());
      return [];
    });
  }, []);

  // Full-resolution export using Worker
  const exportCollage = useCallback(
    async (outputFormat?: "jpeg" | "png") => {
      if (images.length < 2) return;
      setIsGenerating(true);
      setProgress(0);
      setExportBitmap(null);

      try {
        // Use worker for full-res generation
        const bitmap = await generateCollageWithWorker(
          images,
          config,
          setProgress,
        );
        setExportBitmap(bitmap);

        // Render to canvas for download
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(bitmap, 0, 0);

        const fmt = outputFormat ?? config.outputFormat;
        const ext = fmt === "png" ? ".png" : ".jpg";
        const filename = `photoweave-collage${ext}`;

        await downloadCanvas(canvas, fmt, filename);
      } catch (err) {
        console.error("Export failed:", err);
      } finally {
        setIsGenerating(false);
      }
    },
    [images, config],
  );

  return {
    images,
    config,
    setConfig,
    previewCanvas,
    isGenerating,
    progress,
    gridInfo,
    exportBitmap,
    addImages,
    removeImage,
    reorderImages,
    shuffleImages,
    sortImagesChronologically,
    clearImages,
    exportCollage,
  };
}
