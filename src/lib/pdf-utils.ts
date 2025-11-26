import jsPDF from 'jspdf';
import { LayoutResult, StandardDecklist, PaperSize, MachineId } from '@/core/types';
import { renderPageToCanvas } from './render-utils';

export async function generatePdf(
  layout: LayoutResult,
  decklist: StandardDecklist,
  machineId: MachineId,
  paperSize: PaperSize
): Promise<Blob> {
  // Create PDF
  // jsPDF units: mm is good.
  // Orientation: landscape (since our layouts are defined as landscape)
  const format = paperSize === 'letter' ? 'letter' : 'a4';
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: format
  });

  const widthMm = doc.internal.pageSize.getWidth();
  const heightMm = doc.internal.pageSize.getHeight();

  for (let i = 0; i < layout.pages.length; i++) {
    const page = layout.pages[i];
    if (i > 0) doc.addPage(format, 'landscape');

    // Create a temporary canvas
    const canvas = document.createElement('canvas');
    canvas.width = layout.paperWidth;
    canvas.height = layout.paperHeight;

    // Filter cards for this page
    const pageCardIds = new Set(page.items.map(item => item.cardId));
    const pageCards = decklist.cards.filter(c => pageCardIds.has(c.id));

    // Only render overlays (cut lines) for hand-cut mode
    const shouldRenderOverlays = machineId === 'hand';

    await renderPageToCanvas(
      canvas,
      page,
      pageCards,
      machineId,
      paperSize,
      layout.paperWidth,
      layout.paperHeight,
      layout.cardSize,
      { renderOverlays: shouldRenderOverlays }
    );

    // Add canvas to PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95); // JPEG is faster/smaller, 0.95 quality
    doc.addImage(imgData, 'JPEG', 0, 0, widthMm, heightMm);
  }

  return doc.output('blob');
}
