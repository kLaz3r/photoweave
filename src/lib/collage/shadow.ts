/**
 * Draw an image with a soft drop shadow using the Canvas native shadow API.
 * Port of Python _add_shadow (lines 966–1034), adapted for Canvas 2D.
 */
export function drawImageWithShadow(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
  spacingPixels: number,
): void {
  // Shadow parameters derived from spacing (same formula as Python lines 972–976)
  const offset = Math.max(1, Math.round(spacingPixels * 0.12));
  const blurRadius = Math.max(3, Math.round(spacingPixels * 0.6));
  const borderThickness = Math.min(
    12,
    Math.max(2, Math.round(spacingPixels * 0.14)),
  );

  // Save context
  ctx.save();

  // Configure shadow — offset diagonally (shadow appears bottom-right of image)
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = blurRadius;
  ctx.shadowOffsetX = offset;
  ctx.shadowOffsetY = offset;

  // Clip to rounded rect for softer corners
  const cornerRadius = Math.max(2, Math.round(Math.min(w, h) * 0.03));
  _roundedRect(ctx, x, y, w, h, cornerRadius);
  ctx.fill();

  // Restore shadow settings before drawing border
  ctx.restore();
  ctx.save();

  // Draw inner white border (topmost)
  ctx.strokeStyle = "white";
  ctx.lineWidth = borderThickness;

  // Clip to inner rect for border drawing
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, cornerRadius);
    ctx.stroke();
  } else {
    // Fallback for browsers without roundRect
    _roundedRect(ctx, x, y, w, h, cornerRadius);
    ctx.stroke();
  }

  // Draw the actual image on top
  ctx.drawImage(img, x, y, w, h);

  ctx.restore();
}

/**
 * Draw an image without shadow — just ctx.drawImage.
 */
export function drawImageSimple(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.drawImage(img, x, y, w, h);
}

function _roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}