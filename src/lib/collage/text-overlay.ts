import type { TextOverlay, ImageBlock } from "./config";

function hexToRgba(hex: string, opacity: number): string {
  const normalized = hex.startsWith("#") ? hex.slice(1) : hex;
  const full =
    normalized.length === 6
      ? normalized + "ff"
      : normalized.padEnd(8, "f");
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

function findEmptyRegion(
  blocks: ImageBlock[],
  canvasW: number,
  canvasH: number,
  textWidth: number,
  textHeight: number,
  margin: number,
): { x: number; y: number } | null {
  const candidates: Array<{ x: number; y: number }> = [];

  // Center of canvas
  candidates.push({
    x: canvasW / 2 - textWidth / 2,
    y: canvasH / 2 - textHeight / 2,
  });

  // Top-left quadrant
  candidates.push({ x: margin, y: margin });
  // Top-right
  candidates.push({ x: canvasW - textWidth - margin, y: margin });
  // Bottom-left
  candidates.push({ x: margin, y: canvasH - textHeight - margin });
  // Bottom-right
  candidates.push({
    x: canvasW - textWidth - margin,
    y: canvasH - textHeight - margin,
  });
  // Center-top
  candidates.push({
    x: canvasW / 2 - textWidth / 2,
    y: margin,
  });
  // Center-bottom
  candidates.push({
    x: canvasW / 2 - textWidth / 2,
    y: canvasH - textHeight - margin,
  });

  function overlapsBlock(
    cx: number,
    cy: number,
    tw: number,
    th: number,
  ): boolean {
    for (const block of blocks) {
      if (
        cx + tw > block.x + 2 &&
        cx < block.x + block.width - 2 &&
        cy + th > block.y + 2 &&
        cy < block.y + block.height - 2
      ) {
        return true;
      }
    }
    return false;
  }

  for (const cand of candidates) {
    if (
      cand.x >= margin &&
      cand.y >= margin &&
      cand.x + textWidth <= canvasW - margin &&
      cand.y + textHeight <= canvasH - margin &&
      !overlapsBlock(cand.x, cand.y, textWidth, textHeight)
    ) {
      return cand;
    }
  }

  // Fallback: try random positions
  for (let attempt = 0; attempt < 50; attempt++) {
    const rx = margin + Math.random() * (canvasW - textWidth - margin * 2);
    const ry = margin + Math.random() * (canvasH - textHeight - margin * 2);
    if (!overlapsBlock(rx, ry, textWidth, textHeight)) {
      return { x: rx, y: ry };
    }
  }

  return null;
}

export function renderTextOverlays(
  ctx: CanvasRenderingContext2D,
  overlays: TextOverlay[],
  blocks: ImageBlock[],
  canvasW: number,
  canvasH: number,
  margin: number,
): void {
  if (!overlays.length) return;

  for (const overlay of overlays) {
    if (!overlay.text.trim()) continue;
    if (overlay.fontSize <= 0) continue;

    ctx.save();

    ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
    const metrics = ctx.measureText(overlay.text);
    const textWidth = metrics.width;
    const textHeight =
      metrics.fontBoundingBoxAscent != null &&
      metrics.fontBoundingBoxDescent != null
        ? metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
        : overlay.fontSize * 1.2;

    if (isNaN(textWidth) || textWidth <= 0) {
      ctx.restore();
      continue;
    }

    const region = findEmptyRegion(
      blocks,
      canvasW,
      canvasH,
      textWidth,
      textHeight,
      margin,
    );

    if (!region) {
      ctx.restore();
      continue;
    }

    const cx = region.x + textWidth / 2;
    const cy = region.y + textHeight / 2;

    ctx.translate(cx, cy);
    if (overlay.rotation !== 0) {
      ctx.rotate((overlay.rotation * Math.PI) / 180);
    }

    ctx.fillStyle = hexToRgba(overlay.color, overlay.opacity);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(overlay.text, 0, 0);

    ctx.restore();
  }
}
