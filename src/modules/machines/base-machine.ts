import { ICuttingMachine, LayoutResult, StandardDecklist, LayoutPage, PaperSize, CardSize, MachineId } from '@/core/types';
import { LAYOUTS } from '@/config/layouts';

export abstract class BaseCuttingMachine implements ICuttingMachine {
  abstract id: MachineId;
  abstract name: string;
  abstract bleedMm: number;

  async calculateLayout(
    decklist: StandardDecklist, 
    paperSize: PaperSize, 
    cardSize: CardSize,
    options?: { avoidRegistrationMarks?: boolean }
  ): Promise<LayoutResult> {
    const paperLayout = LAYOUTS.paper_layouts[paperSize];
    if (!paperLayout) throw new Error(`Unsupported paper size: ${paperSize}`);

    const cardLayout = paperLayout.card_layouts[cardSize];
    if (!cardLayout) throw new Error(`Unsupported card size ${cardSize} for paper ${paperSize}`);

    const cardDims = LAYOUTS.card_sizes[cardSize];
    
    // Constants for dynamic layout
    const GAP = 12; // 1mm gap between cards
    
    const numCols = cardLayout.cols;
    const numRows = cardLayout.rows;

    const gridWidth = (numCols * cardDims.width) + ((numCols - 1) * GAP);
    const gridHeight = (numRows * cardDims.height) + ((numRows - 1) * GAP);

    const startX = Math.floor((paperLayout.width - gridWidth) / 2);
    const startY = Math.floor((paperLayout.height - gridHeight) / 2);

    // Flatten decklist into individual cards
    const allCards: string[] = [];
    decklist.cards.forEach(card => {
      for (let i = 0; i < card.quantity; i++) {
        allCards.push(card.id);
      }
    });

    const pages: LayoutPage[] = [];
    const cardsPerPage = numCols * numRows;

    let currentCardIndex = 0;
    let pageIndex = 0;

    while (currentCardIndex < allCards.length) {
      const pageItems: LayoutPage['items'] = [];
      
      // Fill one page
      for (let i = 0; i < cardsPerPage && currentCardIndex < allCards.length; i++) {
        // Calculate grid position
        const col = i % numCols;
        const row = Math.floor(i / numCols);

        // Check for "Safe Layout" skip
        // Skip Bottom-Left (col 0, last row)
        if (options?.avoidRegistrationMarks && col === 0 && row === numRows - 1) {
          continue; // Skip this slot, do not increment currentCardIndex
        }

        const cardId = allCards[currentCardIndex];
        
        // Calculate dynamic position
        const x = startX + (col * (cardDims.width + GAP));
        const y = startY + (row * (cardDims.height + GAP));

        pageItems.push({
          cardId,
          x,
          y,
          width: cardDims.width,
          height: cardDims.height,
          rotation: 0
        });

        currentCardIndex++;
      }

      pages.push({
        pageNumber: pageIndex + 1,
        items: pageItems
      });
      pageIndex++;
    }

    return {
      pages,
      totalCards: allCards.length,
      paperWidth: paperLayout.width,
      paperHeight: paperLayout.height,
      cardSize
    };
  }

  abstract getRegistrationTemplate(paperSize: PaperSize): string | null;
  abstract generateCutFile(layout: LayoutResult): Promise<Blob>;
}
