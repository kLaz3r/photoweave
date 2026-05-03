"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploaderProps {
  images: Array<{ previewUrl: string; id: string }>;
  onFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onShuffle: () => void;
  onSortChronologically: () => void;
}

export function ImageUploader({
  images,
  onFiles,
  onRemove,
  onClear,
  onShuffle,
  onSortChronologically,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const appendModeRef = useRef(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFiles(acceptedFiles);
    },
    [onFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".bmp",
        ".webp",
        ".tiff",
        ".tif",
      ],
    },
    minSize: 0,
  });

  const handlePickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFiles(files);
    e.target.value = "";
  };

  const handlePickAndReplace = () => {
    appendModeRef.current = false;
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  };

  const handlePickAndAppend = () => {
    appendModeRef.current = true;
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  };

  const totalMB = images.length > 0 ? images.length * 0.5 : 0;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-2xl md:text-3xl">File Upload</h2>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={[
          "flex min-h-40 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors",
          isDragActive
            ? "border-[color:var(--theme-primary)] bg-[color:var(--theme-primary)]/10"
            : "border-[color:color-mix(in_oklch,var(--theme-text)_25%,transparent)]",
        ].join(" ")}
      >
        <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={handlePickFiles} />
        <input {...getInputProps()} />
        <span className="text-center text-lg opacity-80">
          {isDragActive ? (
            <>Drop photos here</>
          ) : (
            <>
              Drag & Drop
              <br />
              Photos Here
            </>
          )}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="w-full rounded-full bg-[color:var(--theme-primary)]/80 px-6 py-3 text-lg font-semibold text-white transition hover:bg-[color:var(--theme-primary)]"
          onClick={handlePickAndReplace}
        >
          Choose Files
        </button>
        <button
          type="button"
          className="w-full rounded-full border border-current/20 px-6 py-2 text-base transition hover:bg-white/5"
          onClick={handlePickAndAppend}
        >
          + Add More Photos
        </button>
      </div>

      {/* Stats */}
      <div className="text-sm opacity-70">
        <p>{images.length} Files</p>
        <p>~{totalMB.toFixed(0)} MB</p>
      </div>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-60">Image Order</span>
            <div className="flex flex-1 gap-2">
              <button
                type="button"
                aria-label="Random order"
                title="Shuffle images in random order"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-current/15 px-3 py-1.5 text-xs font-medium transition hover:bg-white/5"
                onClick={onShuffle}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
                Random
              </button>
              <button
                type="button"
                aria-label="Chronological order"
                title="Sort images by date taken"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-current/15 px-3 py-1.5 text-xs font-medium transition hover:bg-white/5"
                onClick={onSortChronologically}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="15" y2="18" />
                </svg>
                By Date
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-md bg-[color:color-mix(in_oklch,var(--theme-text)_12%,transparent)]"
            >
              <Image
                src={img.previewUrl}
                alt="preview"
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                aria-label="Remove"
                className="absolute top-1 right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-xs text-white hover:bg-black/90"
                onClick={() => onRemove(img.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        </div>
      )}

      {/* Clear */}
      {images.length > 0 && (
        <button
          type="button"
          className="w-full rounded-full border border-current/20 px-6 py-2 text-base"
          onClick={onClear}
        >
          × Clear All
        </button>
      )}
    </div>
  );
}