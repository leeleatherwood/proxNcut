import { BaseCuttingMachine } from './base-machine';
import { LayoutResult, PaperSize, CardSize, LayoutPage, MachineId } from '@/core/types';
import { LAYOUTS } from '@/config/layouts';

export class SilhouetteMachine extends BaseCuttingMachine {
  id: MachineId = 'silhouette';
  name = 'Silhouette Cameo (Type 1 Marks)';
  bleedMm = 0.5; // 0.5mm bleed (half of 1mm gap)

  // 300 DPI constants
  private readonly DPI = 300;

  getRegistrationTemplate(paperSize: PaperSize): string | null {
    // We now render marks dynamically, so no static image needed
    return null;
  }

  renderRegistrationMarks(ctx: CanvasRenderingContext2D, paperWidth: number, paperHeight: number): void {
    // Standard Silhouette Registration Marks (Type 1)
    // Dimensions in inches, converted to pixels (300 DPI)
    const INCH = 300;
    
    // Adjusted to avoid overlap with standard card layouts
    // User must configure Silhouette Studio to match these:
    // Inset: 0.250 inches
    // Length: 0.375 inches (Reduced to avoid overlap)
    // Thickness: 0.020 inches (default)
    const MARGIN = 0.25 * INCH; 
    const LENGTH = 0.375 * INCH; 
    const THICKNESS = 0.020 * INCH; 
    
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = THICKNESS;

    // 1. Top-Left Square
    // It's a filled square
    // Position: Top-Left margin
    ctx.fillRect(MARGIN, MARGIN, LENGTH, LENGTH);

    // 2. Top-Right Bracket
    // Position: Top-Right margin
    // The "corner" of the bracket is at (Width - Margin, Margin)
    // It extends Left and Down
    const trX = paperWidth - MARGIN;
    const trY = MARGIN;
    
    ctx.beginPath();
    // Horizontal leg (going left from corner)
    ctx.moveTo(trX - LENGTH, trY + (THICKNESS/2)); 
    ctx.lineTo(trX - (THICKNESS/2), trY + (THICKNESS/2));
    // Vertical leg (going down from corner)
    ctx.lineTo(trX - (THICKNESS/2), trY + LENGTH);
    ctx.stroke();

    // 3. Bottom-Left Bracket
    // Position: Bottom-Left margin
    // The "corner" is at (Margin, Height - Margin)
    // It extends Right and Up
    const blX = MARGIN;
    const blY = paperHeight - MARGIN;

    ctx.beginPath();
    // Vertical leg (going up from corner)
    ctx.moveTo(blX + (THICKNESS/2), blY - LENGTH);
    ctx.lineTo(blX + (THICKNESS/2), blY - (THICKNESS/2));
    // Horizontal leg (going right from corner)
    ctx.lineTo(blX + LENGTH, blY - (THICKNESS/2));
    ctx.stroke();

    ctx.restore();
  }

  renderOverlays(ctx: CanvasRenderingContext2D, page: LayoutPage, paperWidth: number, paperHeight: number, cardSize?: CardSize): void {
    ctx.save();
    ctx.strokeStyle = '#FF00FF'; // Pink
    ctx.lineWidth = 1;

    // Get corner radius from config or default to 2.75mm
    const cornerRadiusMm = cardSize ? LAYOUTS.card_sizes[cardSize].cornerRadiusMm : 2.75;
    const radiusPx = (cornerRadiusMm / 25.4) * 300;

    // 1. Draw Card Cut Lines
    for (const item of page.items) {
      ctx.beginPath();
      const x = item.x;
      const y = item.y;
      const w = item.width;
      const h = item.height;
      const r = radiusPx;

      // Draw Rounded Rectangle manually for compatibility
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
      ctx.stroke();
    }

    ctx.restore();
  }

  async generateCutFile(layout: LayoutResult): Promise<Blob> {
    // Generate DXF Content
    // Units: Millimeters
    // Origin: Center of the page
    
    const pxToMm = (px: number) => px * (25.4 / 300);
    const centerXPx = layout.paperWidth / 2;
    const centerYPx = layout.paperHeight / 2;

    // Convert Canvas Point (Top-Left Origin) to DXF Point (Center Origin, Y-Up)
    const toDxfPt = (xPx: number, yPx: number) => {
      const xMm = pxToMm(xPx - centerXPx);
      const yMm = pxToMm(centerYPx - yPx);
      return { x: xMm, y: yMm };
    };

    let dxf = "";
    
    // DXF Header (Minimal)
    dxf += "0\nSECTION\n2\nHEADER\n0\nENDSEC\n";
    dxf += "0\nSECTION\n2\nENTITIES\n";

    // Helper to add Polyline with Bulge
    const addPolyline = (points: {x: number, y: number, bulge?: number}[], closed: boolean = true) => {
        dxf += "0\nLWPOLYLINE\n";
        dxf += "8\nCutLines\n"; 
        dxf += `90\n${points.length}\n`;
        dxf += `70\n${closed ? 1 : 0}\n`; // 1 = Closed, 0 = Open
        for (const pt of points) {
            dxf += `10\n${pt.x.toFixed(4)}\n20\n${pt.y.toFixed(4)}\n`;
            if (pt.bulge) {
                dxf += `42\n${pt.bulge}\n`;
            }
        }
    };

    const CORNER_RADIUS = LAYOUTS.card_sizes[layout.cardSize].cornerRadiusMm; // mm
    const BULGE = -0.41421356; // tan(22.5) for 90deg clockwise arc

    // 1. Cut Lines (Cards)
    if (layout.pages.length > 0) {
      const page = layout.pages[0];
      
      for (const item of page.items) {
        // Calculate corners in MM relative to center
        // Item coords are Top-Left in pixels
        
        const tl = toDxfPt(item.x, item.y); // Top-Left corner of rect in DXF coords
        // Note: toDxfPt returns {x, y} in MM.
        // tl.x is Left, tl.y is Top (Higher Y).
        
        const widthMm = pxToMm(item.width);
        const heightMm = pxToMm(item.height);
        const r = CORNER_RADIUS;

        const left = tl.x;
        const top = tl.y;
        const right = left + widthMm;
        const bottom = top - heightMm; // Bottom is lower Y
        
        // Points (Clockwise)
        const p1 = { x: left + r, y: top }; // Start Top Edge
        const p2 = { x: right - r, y: top, bulge: BULGE }; // End Top Edge -> Arc
        const p3 = { x: right, y: top - r }; // Start Right Edge
        const p4 = { x: right, y: bottom + r, bulge: BULGE }; // End Right Edge -> Arc
        const p5 = { x: right - r, y: bottom }; // Start Bottom Edge
        const p6 = { x: left + r, y: bottom, bulge: BULGE }; // End Bottom Edge -> Arc
        const p7 = { x: left, y: bottom + r }; // Start Left Edge
        const p8 = { x: left, y: top - r, bulge: BULGE }; // End Left Edge -> Arc
        
        addPolyline([p1, p2, p3, p4, p5, p6, p7, p8], true);
      }
    }

    dxf += "0\nENDSEC\n0\nEOF\n";

    return new Blob([dxf], { type: 'application/dxf' });
  }
}
