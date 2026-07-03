"use client";

import { memo, useEffect, useRef, useState } from "react";
import Image from "next/image";

interface CollageCanvasProps {
  canvas: HTMLCanvasElement | null;
  isPreviewLoading: boolean;
  isGenerating: boolean;
  progress: number;
  label?: string;
}

export const CollageCanvas = memo(function CollageCanvas({
  canvas,
  isPreviewLoading,
  isGenerating,
  progress,
  label = "Preview",
}: CollageCanvasProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const prevCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvas) {
      setDataUrl(null);
      prevCanvasRef.current = null;
      return;
    }
    if (canvas === prevCanvasRef.current) return;
    prevCanvasRef.current = canvas;

    // canvas.toDataURL is synchronous and safe for preview use
    const url = canvas.toDataURL("image/png");
    setDataUrl(url);

    return () => {
      // toDataURL creates no managed URL — nothing to revoke
    };
  }, [canvas]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_65%,transparent)]">
        {dataUrl ? (
          <Image
            src={dataUrl}
            alt="Collage preview"
            fill
            sizes="(min-width: 768px) 400px, 320px"
            className="object-contain"
            unoptimized
          />
        ) : isPreviewLoading ? (
          <div className="flex h-full items-center justify-center">
            <svg
              className="h-8 w-8 animate-spin text-[color:var(--theme-accent)]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-label="Loading preview"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="opacity-40">{label}</span>
          </div>
        )}

        {/* Progress overlay */}
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                <span className="mb-3 text-lg font-semibold text-white">
                  Rendering…
                </span>
                <div
                  className="h-2 w-48 rounded-full bg-white/30"
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
                <span className="mt-2 text-sm text-white/80">{progress}%</span>
              </div>
            )}
      </div>
    </div>
  );
});
