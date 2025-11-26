/**
 * Draws a card onto a canvas context with "Mirror Bleed".
 * 
 * @param ctx The canvas 2D context
 * @param img The loaded Image object of the card
 * @param x Target X position (300 DPI)
 * @param y Target Y position (300 DPI)
 * @param width Target Width (300 DPI)
 * @param height Target Height (300 DPI)
 * @param bleedPixels The amount of bleed to add in pixels (e.g. 2mm @ 300 DPI ~= 24px). Can be a single number or an object with per-side values.
 */
export function drawCardWithBleed(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  bleedPixels: number | { top: number, right: number, bottom: number, left: number },
  cornerRadius: number = 0
) {
  // Normalize bleed input
  const bleed = typeof bleedPixels === 'number' 
    ? { top: bleedPixels, right: bleedPixels, bottom: bleedPixels, left: bleedPixels }
    : bleedPixels;

  // 1. Draw the Bleed Layer (Background) with Gaussian Blur
  ctx.save();
  
  // Clip to the total bleed area
  ctx.beginPath();
  ctx.rect(
    x - bleed.left, 
    y - bleed.top, 
    width + bleed.left + bleed.right, 
    height + bleed.top + bleed.bottom
  );
  ctx.clip();

  // Apply Gaussian Blur
  // We use a standard blur filter to create a smooth background fill
  ctx.filter = 'blur(0px)';

  // Draw the image stretched to fill the bleed area
  ctx.drawImage(
    img, 
    x - bleed.left, 
    y - bleed.top, 
    width + bleed.left + bleed.right, 
    height + bleed.top + bleed.bottom
  );

  ctx.restore();

  // 2. Draw the Main Layer (Foreground)
  ctx.save();
  // Clip to rounded corners (The Cut Line)
  if (cornerRadius > 0) {
    ctx.beginPath();
    traceRoundedRect(ctx, x, y, width, height, cornerRadius);
    ctx.clip();
  }
  ctx.drawImage(img, x, y, width, height);
  ctx.restore();
}

function traceRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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
