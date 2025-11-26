import { LayoutPage, StandardCard, CardSize, PaperSize, MachineId } from '@/core/types';
import { MachineRegistry } from '@/core/registry';
import { drawCardWithBleed } from '@/lib/canvas-utils';
import { LAYOUTS } from '@/config/layouts';
import { loadImage } from '@/lib/image-utils';

export async function renderPageToCanvas(
  canvas: HTMLCanvasElement,
  page: LayoutPage,
  cards: StandardCard[],
  machineId: MachineId,
  paperSize: PaperSize,
  paperWidth: number,
  paperHeight: number,
  cardSize: CardSize,
  options: { renderOverlays?: boolean } = { renderOverlays: true }
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const machine = MachineRegistry.get(machineId);
  if (!machine) return;

  // Clear & Fill White
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Registration Template
  const bgUrl = machine.getRegistrationTemplate(paperSize);
  if (bgUrl) {
    const bgImage = new Image();
    bgImage.src = bgUrl;
    await new Promise((resolve) => { bgImage.onload = resolve; });
    ctx.drawImage(bgImage, 0, 0, paperWidth, paperHeight);
  }

  // Draw Dynamic Registration Marks
  if (machine.renderRegistrationMarks) {
    machine.renderRegistrationMarks(ctx, paperWidth, paperHeight);
  }

  // Draw Cards
  const cornerRadiusMm = LAYOUTS.card_sizes[cardSize].cornerRadiusMm;
  const cornerRadiusPx = (cornerRadiusMm / 25.4) * 300;

  for (const item of page.items) {
    const card = cards.find(c => c.id === item.cardId);
    if (!card) continue;

    const imgResult = await loadImage(card.imageUrl);
    if (imgResult.success) {
      const bleedPixels = Math.round((machine.bleedMm / 25.4) * 300);
      drawCardWithBleed(ctx, imgResult.value, item.x, item.y, item.width, item.height, bleedPixels, cornerRadiusPx);
    } else {
      console.error(`Failed to load image for card ${card.name}:`, imgResult.error);
      // Optionally, draw a placeholder
      ctx.fillStyle = '#cccccc';
      ctx.fillRect(item.x, item.y, item.width, item.height);
      ctx.fillStyle = 'black';
      ctx.fillText(`Error: ${card.name}`, item.x + 10, item.y + 20);
    }
  }

  // Draw Overlays (Cut Lines)
  if (options.renderOverlays && machine.renderOverlays) {
    machine.renderOverlays(ctx, page, paperWidth, paperHeight, cardSize);
  }
}
