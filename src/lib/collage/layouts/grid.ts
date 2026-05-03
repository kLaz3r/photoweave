import type { ImageBlock } from "../config";

/**
 * Spacing pixel formula (matches Python line 445–446 and line 620).
 */
function spacingPxFn(
  canvasWidth: number,
  canvasHeight: number,
  spacingPercent: number,
): number {
  return Math.round(
    Math.min(canvasWidth, canvasHeight) * (spacingPercent / 100) * 0.05,
  );
}

export interface GridInfo {
  currentGrid: {
    totalImages: number;
    cols: number;
    rows: number;
    imagesInLastRow: number;
    isPerfect: boolean;
  };
  closestPerfectGrid: {
    type: "perfect" | "add_images" | "remove_images";
    totalImages: number;
    cols: number;
    rows: number;
    imagesNeeded: number;
    imagesToRemove: number;
  } | null;
  recommendations: {
    addImages: Array<{
      imagesNeeded: number;
      totalImages: number;
      cols: number;
      rows: number;
    }>;
    removeImages: Array<{
      imagesToRemove: number;
      totalImages: number;
      cols: number;
      rows: number;
    }>;
  };
}

export function gridPack(
  canvasWidth: number,
  canvasHeight: number,
  spacingPercent: number,
  images: { width: number; height: number }[],
): ImageBlock[] {
  const numImages = images.length;
  if (numImages === 0) return [];

  const spacingPx = spacingPxFn(canvasWidth, canvasHeight, spacingPercent);

  const computedCols = Math.max(
    1,
    Math.floor(Math.sqrt(numImages * (canvasWidth / canvasHeight))),
  );
  const cols = computedCols;
  const rows = Math.max(1, Math.ceil(numImages / cols));

  const cellWidth = Math.floor(
    (canvasWidth - (cols - 1) * spacingPx - 2 * spacingPx) / cols,
  );
  const cellHeight = Math.floor(
    (canvasHeight - (rows - 1) * spacingPx - 2 * spacingPx) / rows,
  );

  const blocks: ImageBlock[] = [];
  for (let i = 0; i < numImages; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    blocks.push({
      x: spacingPx + col * (cellWidth + spacingPx),
      y: spacingPx + row * (cellHeight + spacingPx),
      width: cellWidth,
      height: cellHeight,
      imageIndex: i,
    });
  }

  return blocks;
}

export function calculateOptimalGrid(
  numImages: number,
  canvasWidth: number,
  canvasHeight: number,
  _spacingPercent: number,
): GridInfo {
  const computedCols = Math.max(
    1,
    Math.floor(Math.sqrt(numImages * (canvasWidth / canvasHeight))),
  );
  const cols = computedCols;
  const rows = Math.max(1, Math.ceil(numImages / cols));

  const completeGridImages = cols * rows;
  const imagesInLastRow = numImages % cols === 0 ? cols : numImages % cols;

  // Find next perfect grids
  const addImages: Array<{
    imagesNeeded: number;
    totalImages: number;
    cols: number;
    rows: number;
  }> = [];

  for (let i = 1; i <= 10; i++) {
    const testImages = numImages + i;
    if (testImages > 200) break;
    const testCols = Math.max(
      1,
      Math.floor(Math.sqrt(testImages * (canvasWidth / canvasHeight))),
    );
    const testRows = Math.ceil(testImages / testCols);
    if (testCols * testRows === testImages) {
      addImages.push({
        imagesNeeded: i,
        totalImages: testImages,
        cols: testCols,
        rows: testRows,
      });
      if (addImages.length >= 3) break;
    }
  }

  // Find previous perfect grids
  const removeImages: Array<{
    imagesToRemove: number;
    totalImages: number;
    cols: number;
    rows: number;
  }> = [];

  for (let i = 1; i < Math.min(11, numImages); i++) {
    const testImages = numImages - i;
    if (testImages < 2) break;
    const testCols = Math.max(
      1,
      Math.floor(Math.sqrt(testImages * (canvasWidth / canvasHeight))),
    );
    const testRows = Math.ceil(testImages / testCols);
    if (testCols * testRows === testImages) {
      removeImages.push({
        imagesToRemove: i,
        totalImages: testImages,
        cols: testCols,
        rows: testRows,
      });
      if (removeImages.length >= 3) break;
    }
  }

  // Closest perfect grid
  let closestPerfectGrid: GridInfo["closestPerfectGrid"] = null;
  if (numImages === completeGridImages) {
    closestPerfectGrid = {
      type: "perfect",
      totalImages: numImages,
      cols,
      rows,
      imagesNeeded: 0,
      imagesToRemove: 0,
    };
  } else {
    let minDiff = Infinity;

    for (const g of addImages) {
      if (g.imagesNeeded < minDiff) {
        minDiff = g.imagesNeeded;
        closestPerfectGrid = {
          type: "add_images",
          totalImages: g.totalImages,
          cols: g.cols,
          rows: g.rows,
          imagesNeeded: g.imagesNeeded,
          imagesToRemove: 0,
        };
      }
    }

    for (const g of removeImages) {
      if (g.imagesToRemove < minDiff) {
        minDiff = g.imagesToRemove;
        closestPerfectGrid = {
          type: "remove_images",
          totalImages: g.totalImages,
          cols: g.cols,
          rows: g.rows,
          imagesNeeded: 0,
          imagesToRemove: g.imagesToRemove,
        };
      }
    }
  }

  return {
    currentGrid: {
      totalImages: numImages,
      cols,
      rows,
      imagesInLastRow,
      isPerfect: numImages === completeGridImages,
    },
    closestPerfectGrid,
    recommendations: { addImages, removeImages },
  };
}
