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
import toast from "react-hot-toast";
import { useUndoRedo } from "~/hooks/useUndoRedo";

interface CollageState {
  images: LoadedImage[];
  config: CollageConfig;
}

export function useCollage() {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [config, setConfig] = useState<CollageConfig>(DEFAULT_COLLAGE_CONFIG);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(
    null,
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportBitmap, setExportBitmap] = useState<ImageBitmap | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stateRef = useRef<CollageState>({
    images: [],
    config: DEFAULT_COLLAGE_CONFIG,
  });

  const {
    canUndo,
    canRedo,
    pushConfigChange,
    pushAction,
    undo,
    redo,
  } = useUndoRedo<CollageState>({
    maxHistory: 50,
    debounceMs: 500,
  });

  const restoreState = useCallback(
    (state: CollageState) => {
      stateRef.current = state;
      setImages(state.images);
      setConfig(state.config);
    },
    [],
  );

  const handleUndo = useCallback(() => {
    const current = stateRef.current;
    const restored = undo(current);
    if (restored) {
      restoreState(restored);
    }
  }, [undo, restoreState]);

  const handleRedo = useCallback(() => {
    const current = stateRef.current;
    const restored = redo(current);
    if (restored) {
      restoreState(restored);
    }
  }, [redo, restoreState]);

  // Sync stateRef whenever images or config change
  useEffect(() => {
    stateRef.current = { images, config };
  }, [images, config]);

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
      setIsPreviewLoading(true);
      void (async () => {
        try {
          const canvas = await generatePreview(images, config);
          setPreviewCanvas(canvas);
        } catch (err) {
          console.error("Preview failed:", err);
          toast.error(
            "Failed to generate preview. Try adjusting your settings.",
          );
        } finally {
          setIsPreviewLoading(false);
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
    const dimPx =
      config.dimensionMode === "mm"
        ? {
            w: Math.round((config.widthMm / 25.4) * config.dpi),
            h: Math.round((config.heightMm / 25.4) * config.dpi),
          }
        : { w: config.widthPx, h: config.heightPx };
    setGridInfo(
      calculateOptimalGrid(
        images.length,
        dimPx.w,
        dimPx.h,
        config.spacing,
      ),
    );
  }, [
    images.length,
    config.layoutStyle,
    config.spacing,
    config.dimensionMode,
    config.widthMm,
    config.heightMm,
    config.widthPx,
    config.heightPx,
    config.dpi,
  ]);

  const addImages = useCallback(
    async (files: File[]) => {
      pushAction(stateRef.current);
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
    },
    [pushAction],
  );

  const removeImage = useCallback(
    (index: number) => {
      pushAction(stateRef.current);
      setImages((prev) => {
        const removed = prev[index];
        if (removed) removed.bitmap.close();
        return prev.filter((_, i) => i !== index);
      });
    },
    [pushAction],
  );

  const reorderImages = useCallback(
    (from: number, to: number) => {
      pushAction(stateRef.current);
      setImages((prev) => {
        const arr = [...prev];
        const [moved] = arr.splice(from, 1);
        if (moved !== undefined) arr.splice(to, 0, moved);
        return arr;
      });
    },
    [pushAction],
  );

  const shuffleImages = useCallback(() => {
    pushAction(stateRef.current);
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
  }, [pushAction]);

  const sortImagesChronologically = useCallback(() => {
    pushAction(stateRef.current);
    setImages((prev) =>
      [...prev].sort((a, b) => b.file.lastModified - a.file.lastModified),
    );
  }, [pushAction]);

  const clearImages = useCallback(() => {
    pushAction(stateRef.current);
    setImages((prev) => {
      prev.forEach((img) => img.bitmap.close());
      return [];
    });
  }, [pushAction]);

  const setConfigWithHistory = useCallback(
    (next: CollageConfig) => {
      pushConfigChange(stateRef.current);
      setConfig(next);
    },
    [pushConfigChange],
  );

  // Full-resolution export using Worker
  const exportCollage = useCallback(
    async (outputFormat?: "jpeg" | "png") => {
      if (images.length < 2) return;
      setIsGenerating(true);
      setProgress(0);
      setExportBitmap((prev) => {
        prev?.close();
        return null;
      });

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
        toast.success("Collage exported!");
      } catch (err) {
        console.error("Export failed:", err);
        toast.error(
          err instanceof Error
            ? err.message
            : "Export failed. Please try again.",
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [images, config],
  );

  return {
    images,
    config,
    setConfig: setConfigWithHistory,
    previewCanvas,
    isPreviewLoading,
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
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo,
  };
}
