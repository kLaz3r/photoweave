import type { ImageBlock } from "../config";

/**
 * Spacing pixel formula (matches Python line 445–446).
 */
function spacingPixels(canvasWidth: number, canvasHeight: number, spacingPercent: number): number {
  return Math.min(canvasWidth, canvasHeight) * (spacingPercent / 100) * 0.05;
}

interface ImageInfo {
  width: number;
  height: number;
  aspect: number;
}

function evaluateLayout(
  canvasWidth: number,
  canvasHeight: number,
  spacingPx: number,
  photoCount: number,
  columns: number,
): number {
  const columnWidth =
    (canvasWidth - spacingPx * (columns + 1)) / columns;
  const photosPerColumn = Math.ceil(photoCount / columns);
  const totalSpacingPerColumn = spacingPx * (photosPerColumn + 1);
  const availableHeightPerColumn = canvasHeight - totalSpacingPerColumn;
  const avgPhotoHeight = availableHeightPerColumn / photosPerColumn;

  const aspectRatio = columnWidth / avgPhotoHeight;
  const aspectPenalty = Math.abs(aspectRatio - 1.0);

  const remainder = photoCount % columns;
  const unevennessPenalty = remainder > 0 ? remainder / columns : 0;

  return aspectPenalty + unevennessPenalty;
}

function distributePhotos(photoCount: number, columns: number): number[] {
  const distribution: number[] = [];
  const photosPerColumn = Math.floor(photoCount / columns);
  const remainder = photoCount % columns;
  for (let i = 0; i < columns; i++) {
    distribution.push(photosPerColumn + (i < remainder ? 1 : 0));
  }
  return distribution;
}

interface LayoutItem {
  x: number;
  y: number;
  width: number;
  height: number;
  info: ImageInfo;
}

function calculateOptimalColumns(
  canvasWidth: number,
  canvasHeight: number,
  spacingPx: number,
  photoCount: number,
): number {
  const minColumns = Math.max(
    1,
    Math.floor(Math.sqrt(photoCount * (canvasWidth / canvasHeight))),
  );
  const maxColumns = Math.min(
    photoCount,
    Math.max(1, Math.floor(canvasWidth / 200)),
  );

  let bestColumns = minColumns;
  let bestScore = Infinity;

  for (let cols = minColumns; cols <= maxColumns; cols++) {
    const score = evaluateLayout(
      canvasWidth,
      canvasHeight,
      spacingPx,
      photoCount,
      cols,
    );
    if (score < bestScore) {
      bestScore = score;
      bestColumns = cols;
    }
  }

  return bestColumns;
}

function redistributeVerticalSpace(
  layout: LayoutItem[],
  columns: number,
  canvasHeight: number,
  spacingPx: number,
): LayoutItem[] {
  for (let col = 0; col < columns; col++) {
    const columnItems = layout.filter((item) => {
      const colIdx = Math.floor(
        item.x / (item.width + spacingPx),
      );
      return colIdx === col;
    });

    if (columnItems.length === 0) continue;

    columnItems.sort((a, b) => a.y - b.y);

    const totalCurrentHeight = columnItems.reduce(
      (sum, item) => sum + item.height,
      0,
    );
    const totalSpacing = spacingPx * (columnItems.length + 1);
    const availableHeight = canvasHeight - totalSpacing;

    if (totalCurrentHeight <= 0) continue;

    const scaleFactor = availableHeight / totalCurrentHeight;
    let currentY = spacingPx;

    for (const item of columnItems) {
      item.height *= scaleFactor;
      item.y = currentY;
      currentY += item.height + spacingPx;
    }
  }

  return layout;
}

export function masonryPack(
  canvasWidth: number,
  canvasHeight: number,
  spacingPercent: number,
  images: ImageInfo[],
  _maintainAspect = true,
): ImageBlock[] {
  if (!images.length) return [];

  const spacingPx = Math.round(
    spacingPixels(canvasWidth, canvasHeight, spacingPercent),
  );
  const columns = calculateOptimalColumns(
    canvasWidth,
    canvasHeight,
    spacingPx,
    images.length,
  );

  const distribution = distributePhotos(images.length, columns);

  const columnWidth =
    (canvasWidth - spacingPx * (columns + 1)) / columns;

  // Build raw layout
  const layout: LayoutItem[] = [];
  let photoIndex = 0;

  for (let col = 0; col < columns; col++) {
    const photosInThisColumn = distribution[col] ?? 0;
    const totalSpacing = spacingPx * (photosInThisColumn + 1);
    const availableHeight = canvasHeight - totalSpacing;
    const photoHeight = availableHeight / Math.max(1, photosInThisColumn);

    const x = spacingPx + col * (columnWidth + spacingPx);
    const img = images[photoIndex]!;
    let height = photoHeight;

    // Refine height based on aspect ratio (equivalent to Python refineMasonryLayout)
    if (img.aspect > 0) {
      const idealHeight = columnWidth / img.aspect;
      height = Math.min(height * 1.2, idealHeight);
    }

    layout.push({
      x,
      y: spacingPx,
      width: columnWidth,
      height,
      info: img,
    });
    photoIndex++;

    for (let row = 1; row < photosInThisColumn; row++) {
      const img2 = images[photoIndex]!;
      let h = photoHeight;
      if (img2.aspect > 0) {
        const idealH = columnWidth / img2.aspect;
        h = Math.min(h * 1.2, idealH);
      }
      layout.push({
        x,
        y: spacingPx, // will be recalculated by redistributeVerticalSpace
        width: columnWidth,
        height: h,
        info: img2,
      });
      photoIndex++;
    }
  }

  // Recalculate y positions after refinement (simple: evenly distribute)
  for (let col = 0; col < columns; col++) {
    const colItems = layout.filter(
      (item) => Math.abs(item.x - (spacingPx + col * (columnWidth + spacingPx))) < 1,
    );
    colItems.sort((a, b) => (a.info.aspect > b.info.aspect ? -1 : 1));

    const totalSpacing = spacingPx * (colItems.length + 1);
    const availableHeight = canvasHeight - totalSpacing;
    const scaleFactor = availableHeight / Math.max(1, colItems.reduce((s, i) => s + i.height, 0));

    let currentY = spacingPx;
    for (const item of colItems) {
      item.height *= scaleFactor;
      item.y = currentY;
      currentY += item.height + spacingPx;
    }
  }

  // Final vertical space redistribution
  redistributeVerticalSpace(layout, columns, canvasHeight, spacingPx);

  return layout.map((item, i) => ({
    x: Math.round(item.x),
    y: Math.round(item.y),
    width: Math.round(item.width),
    height: Math.round(item.height),
    imageIndex: i,
  }));
}