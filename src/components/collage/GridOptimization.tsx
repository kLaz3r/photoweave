"use client";

import type { GridInfo } from "~/lib/collage/layouts/grid";

interface GridOptimizationProps {
  gridInfo: GridInfo | null;
  onAddPhotos: () => void;
  onRemovePhotos: (count: number) => void;
}

export function GridOptimization({
  gridInfo,
  onAddPhotos,
  onRemovePhotos,
}: GridOptimizationProps) {
  if (!gridInfo) return null;

  const { closestPerfectGrid, currentGrid } = gridInfo;

  if (currentGrid.isPerfect) {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-400">
        Perfect {currentGrid.cols}×{currentGrid.rows} grid — all cells filled.
      </div>
    );
  }

  if (!closestPerfectGrid) return null;

  if (closestPerfectGrid.type === "add_images") {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_18%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_72%,transparent)] p-3 text-sm">
        <div>
          <span className="font-medium">
            Add {closestPerfectGrid.imagesNeeded} photo
            {closestPerfectGrid.imagesNeeded !== 1 ? "s" : ""} for a perfect{" "}
            {closestPerfectGrid.cols}×{closestPerfectGrid.rows} grid.
          </span>
        </div>
        <button
          type="button"
          className="self-start rounded-full border border-current/20 px-4 py-2 text-xs transition hover:bg-white/5"
          onClick={onAddPhotos}
        >
          Add Photos
        </button>
      </div>
    );
  }

  if (closestPerfectGrid.type === "remove_images") {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_18%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_72%,transparent)] p-3 text-sm">
        <div>
          <span className="font-medium">
            Remove {closestPerfectGrid.imagesToRemove} photo
            {closestPerfectGrid.imagesToRemove !== 1 ? "s" : ""} for a perfect{" "}
            {closestPerfectGrid.cols}×{closestPerfectGrid.rows} grid.
          </span>
        </div>
        <button
          type="button"
          className="self-start rounded-full bg-[color:var(--theme-accent)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
          onClick={() => onRemovePhotos(closestPerfectGrid.imagesToRemove)}
        >
          Remove {closestPerfectGrid.imagesToRemove}
        </button>
      </div>
    );
  }

  return null;
}
