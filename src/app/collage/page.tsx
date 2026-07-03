"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useCollage } from "~/hooks/useCollage";
import { ImageUploader } from "~/components/collage/ImageUploader";
import { ConfigPanel } from "~/components/collage/ConfigPanel";
import { CollageCanvas } from "~/components/collage/CollageCanvas";
import { ExportButton } from "~/components/collage/ExportButton";
import { GridOptimization } from "~/components/collage/GridOptimization";
import { useFaceDetector } from "~/hooks/useFaceDetector";

export default function CollagePage() {
  const {
    images,
    config,
    setConfig,
    previewCanvas,
    isPreviewLoading,
    isGenerating,
    progress,
    gridInfo,
    addImages,
    removeImage,
    clearImages,
    shuffleImages,
    sortImagesChronologically,
    exportCollage,
    undo,
    redo,
    canUndo,
    canRedo,
    reorderImages,
  } = useCollage();

  const {
    isLoading: faceLoading,
    isReady: faceReady,
    isError: faceError,
    error: faceErrorMsg,
    ensureLoaded,
  } = useFaceDetector();

  const addPhotosInputRef = useRef<HTMLInputElement>(null);

  const handleAddPhotos = useCallback(() => {
    addPhotosInputRef.current?.click();
  }, []);

  const handleRemoveN = useCallback(
    (count: number) => {
      const currentImages = imagesRef.current;
      for (let i = 0; i < count; i++) {
        const idx = currentImages.length - 1 - i;
        if (idx >= 0) removeImage(idx);
      }
    },
    [removeImage],
  );

  const imagesRef = useRef(images);
  imagesRef.current = images;

  const thumbnails = useMemo(() => {
    const urls: Array<{ id: string; previewUrl: string }> = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i]!;
      urls.push({
        id: String(i),
        previewUrl: URL.createObjectURL(img.file),
      });
    }
    return urls;
  }, [images]);

  useEffect(() => {
    const currentUrls = thumbnails;
    return () => {
      for (const t of currentUrls) URL.revokeObjectURL(t.previewUrl);
    };
  }, [thumbnails]);

  const handleFiles = useCallback(
    (files: File[]) => void addImages(files),
    [addImages],
  );

  const handleRemove = useCallback(
    (id: string) => removeImage(Number(id)),
    [removeImage],
  );

  const handleReorder = useCallback(
    (from: number, to: number) => reorderImages(from, to),
    [reorderImages],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  return (
    <main className="text-text container mx-auto mt-16 mb-16 px-2 sm:mt-24 sm:mb-16 sm:px-4">
      <section className="relative rounded-[20px] border border-[color:color-mix(in_oklch,var(--theme-text)_10%,transparent)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--theme-background)_60%,transparent),color-mix(in_oklch,var(--theme-background)_30%,transparent))] p-4 shadow-2xl backdrop-blur-2xl sm:rounded-[28px] sm:p-6 md:p-8 lg:p-10">
        <div
          className="absolute inset-0 -z-10 rounded-[20px] bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(168,149,255,0.28),rgba(255,255,255,0)_60%),radial-gradient(1200px_600px_at_110%_110%,rgba(255,160,140,0.35),rgba(255,255,255,0)_60%)] sm:rounded-[28px]"
          aria-hidden
        />

        {/* Hidden file input for "Add Photos" in GridOptimization */}
        <input
          ref={addPhotosInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) void addImages(files);
            e.target.value = "";
          }}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-12">
          {/* Left column: Image uploader */}
          <ImageUploader
            images={thumbnails}
            onFiles={handleFiles}
            onRemove={handleRemove}
            onClear={clearImages}
            onShuffle={shuffleImages}
            onSortChronologically={sortImagesChronologically}
            onReorder={handleReorder}
          />

          {/* Middle column: Preview + export */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl">
              Collage Preview
            </h2>

            <CollageCanvas
              canvas={previewCanvas}
              isPreviewLoading={isPreviewLoading}
              isGenerating={isGenerating && !previewCanvas}
              progress={progress}
            />

            {/* Progress bar (visible even when canvas shows) */}
            {isGenerating && (
              <div>
                <div className="mb-1 text-xs opacity-60">
                  Rendering: {progress}%
                </div>
                <div
                  className="h-2 w-full rounded-full bg-white/10"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-[color:var(--theme-accent)] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Grid optimization */}
            {config.layoutStyle === "grid" && images.length >= 2 && (
              <GridOptimization
                gridInfo={gridInfo}
                onAddPhotos={handleAddPhotos}
                onRemovePhotos={handleRemoveN}
              />
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!canUndo}
                  aria-label="Undo"
                  title="Undo (Ctrl+Z)"
                  className="flex flex-1 items-center justify-center gap-1 rounded-full border border-current/20 px-3 py-1.5 text-xs transition enabled:hover:bg-white/5 disabled:opacity-30 sm:px-4 sm:py-2 sm:text-sm"
                  onClick={() => undo()}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  Undo
                </button>
                <button
                  type="button"
                  disabled={!canRedo}
                  aria-label="Redo"
                  title="Redo (Ctrl+Y)"
                  className="flex flex-1 items-center justify-center gap-1 rounded-full border border-current/20 px-3 py-1.5 text-xs transition enabled:hover:bg-white/5 disabled:opacity-30 sm:px-4 sm:py-2 sm:text-sm"
                  onClick={() => redo()}
                >
                  Redo
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                </button>
              </div>
              {previewCanvas && (
                <button
                  type="button"
                  className="w-full rounded-full border border-current/20 px-4 py-2 text-sm transition hover:bg-white/5 sm:px-6 sm:py-3 sm:text-base"
                  onClick={() => {
                    setConfig({ ...config });
                  }}
                >
                  Refresh Preview
                </button>
              )}
              <ExportButton
                imageCount={images.length}
                isGenerating={isGenerating}
                outputFormat={config.outputFormat}
                onExport={() => void exportCollage()}
              />
            </div>

            <div className="h-px w-full bg-current/10" />
            <p className="text-center text-xs opacity-50 sm:text-sm">
              All processing happens locally in your browser
            </p>
          </div>

          {/* Right column: Config */}
          <ConfigPanel
            config={config}
            onChange={setConfig}
            onFaceDetectorLoading={faceLoading}
            onFaceDetectorReady={faceReady}
            onFaceDetectorError={faceError ? faceErrorMsg : null}
            onEnsureFaceDetector={ensureLoaded}
          />
        </div>
      </section>
    </main>
  );
}
