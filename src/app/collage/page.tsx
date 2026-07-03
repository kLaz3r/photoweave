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

  return (
    <main className="text-text container mx-auto mt-[96px] mb-16 px-4">
      <section className="relative rounded-[28px] border border-[color:color-mix(in_oklch,var(--theme-text)_10%,transparent)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--theme-background)_60%,transparent),color-mix(in_oklch,var(--theme-background)_30%,transparent))] p-6 shadow-2xl backdrop-blur-2xl md:p-8 lg:p-10">
        <div
          className="absolute inset-0 -z-10 rounded-[28px] bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(168,149,255,0.28),rgba(255,255,255,0)_60%),radial-gradient(1200px_600px_at_110%_110%,rgba(255,160,140,0.35),rgba(255,255,255,0)_60%)]"
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          {/* Left column: Image uploader */}
          <ImageUploader
            images={thumbnails}
            onFiles={handleFiles}
            onRemove={handleRemove}
            onClear={clearImages}
            onShuffle={shuffleImages}
            onSortChronologically={sortImagesChronologically}
          />

          {/* Middle column: Preview + export */}
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-2xl md:text-3xl">
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
            <div className="flex flex-col gap-3">
              {previewCanvas && (
                <button
                  type="button"
                  className="w-full rounded-full border border-current/20 px-6 py-3 text-base transition hover:bg-white/5"
                  onClick={() => {
                    // Force re-render of preview
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
            <p className="text-center text-sm opacity-50">
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
