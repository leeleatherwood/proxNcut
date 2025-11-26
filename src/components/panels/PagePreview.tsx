import React, { useEffect, useRef, memo } from 'react';
import { LayoutPage, StandardCard, CardSize, PaperSize, MachineId } from '@/core/types';
import { renderPageToCanvas } from '@/lib/render-utils';

interface PagePreviewProps {
  page: LayoutPage;
  cards: StandardCard[];
  machineId: MachineId;
  paperSize: PaperSize;
  paperWidth: number;
  paperHeight: number;
  zoom: number;
  cardSize: CardSize;
}

const PagePreview = memo(({ page, cards, machineId, paperSize, paperWidth, paperHeight, zoom, cardSize }: PagePreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const render = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await renderPageToCanvas(
        canvas,
        page,
        cards,
        machineId,
        paperSize,
        paperWidth,
        paperHeight,
        cardSize
      );
    };

    render();
  }, [page, cards, machineId, paperSize, paperWidth, paperHeight, cardSize]); // Dependencies for re-render

  return (
    <div className="shadow-2xl transition-all duration-200">
      <canvas
        ref={canvasRef}
        width={paperWidth}
        height={paperHeight}
        style={{
          width: `${(paperWidth / 3) * zoom}px`,
          height: `${(paperHeight / 3) * zoom}px`,
        }}
      />
    </div>
  );
}, (prev, next) => {
  // Custom comparison for React.memo
  // Return true if props are equal (do NOT re-render)
  
  if (prev.machineId !== next.machineId) return false;
  if (prev.paperSize !== next.paperSize) return false;
  if (prev.zoom !== next.zoom) return false; 
  if (prev.cardSize !== next.cardSize) return false;
  
  if (prev.paperWidth !== next.paperWidth) return false;
  if (prev.paperHeight !== next.paperHeight) return false;

  // Deep compare page items
  if (JSON.stringify(prev.page) !== JSON.stringify(next.page)) return false;

  // Compare cards
  if (prev.cards.length !== next.cards.length) return false;
  for (let i = 0; i < prev.cards.length; i++) {
    if (prev.cards[i].id !== next.cards[i].id) return false;
    if (prev.cards[i].imageUrl !== next.cards[i].imageUrl) return false;
  }

  return true;
});

export default PagePreview;
