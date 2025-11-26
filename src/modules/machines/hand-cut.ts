import { BaseCuttingMachine } from './base-machine';
import { LayoutResult, PaperSize, LayoutPage, MachineId } from '@/core/types';

export class HandCutMachine extends BaseCuttingMachine {
  id: MachineId = 'hand';
  name = 'Hand Cut (Guides)';
  bleedMm = 0.5; // 0.5mm bleed (half of 1mm gap)

  // Reuse calculateLayout from BaseCuttingMachine

  getRegistrationTemplate(paperSize: PaperSize): string | null {
    return null; // No registration marks image
  }

  renderRegistrationMarks(ctx: CanvasRenderingContext2D, paperWidth: number, paperHeight: number): void {
    // Hand cut does not use registration marks
  }

  renderOverlays(ctx: CanvasRenderingContext2D, page: LayoutPage, paperWidth: number, paperHeight: number): void {
    ctx.save();
    ctx.strokeStyle = '#000000'; // Black
    ctx.lineWidth = 1; // 1px line
    ctx.setLineDash([]); // Solid line

    // Collect unique X and Y coordinates from items
    const xCoords = new Set<number>();
    const yCoords = new Set<number>();

    for (const item of page.items) {
      xCoords.add(item.x);
      xCoords.add(item.x + item.width);
      yCoords.add(item.y);
      yCoords.add(item.y + item.height);
    }

    // Draw horizontal lines across the entire page
    for (const y of yCoords) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(paperWidth, y);
      ctx.stroke();
    }

    // Draw vertical lines across the entire page
    for (const x of xCoords) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, paperHeight);
      ctx.stroke();
    }

    ctx.restore();
  }

  async generateCutFile(layout: LayoutResult): Promise<Blob> {
    // For hand cutting, the "Cut File" is just the PDF itself usually.
    // But if we need a specific file, maybe a text instructions?
    return new Blob(['Hand cut: Just print the PDF.'], { type: 'text/plain' });
  }
}
