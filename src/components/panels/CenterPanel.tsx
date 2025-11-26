'use client';

import { useEffect, useState } from 'react';
import { useDeckStore } from '@/store/deck-store';
import { useSettingsStore } from '@/store/settings-store';
import { LayoutResult } from '@/core/types';
import PagePreview from './PagePreview';
import { useServices } from '@/services/service-context';

export default function CenterPanel() {
  const { decklist } = useDeckStore();
  const { activeMachineId, paperSize, zoom, sensorSafe, pluginsInitialized } = useSettingsStore();
  const { machineService } = useServices();
  const [layout, setLayout] = useState<LayoutResult | null>(null);

  // Calculate Layout
  useEffect(() => {
    if (!pluginsInitialized) return;
    const calculate = async () => {
      const result = await machineService.calculateLayout(activeMachineId, decklist, paperSize, sensorSafe);
      setLayout(result);
    };
    calculate();
  }, [decklist, activeMachineId, paperSize, sensorSafe, machineService, pluginsInitialized]);

  return (
    <div className="h-full w-full bg-slate-800 overflow-auto p-8 flex flex-col items-center gap-8">
      {!layout && (
        <div className="text-slate-500 mt-20">Add cards to generate preview</div>
      )}
      
      {layout?.pages.map((page) => {
        // Filter cards relevant to this page to pass to memoized component
        // This ensures we don't break memoization by passing a new huge array every time
        const pageCardIds = new Set(page.items.map(i => i.cardId));
        const pageCards = decklist.cards.filter(c => pageCardIds.has(c.id));

        return (
          <PagePreview
            key={page.pageNumber}
            page={page}
            cards={pageCards}
            machineId={activeMachineId}
            paperSize={paperSize}
            paperWidth={layout.paperWidth}
            paperHeight={layout.paperHeight}
            zoom={zoom}
            cardSize={layout.cardSize}
          />
        );
      })}
    </div>
  );
}
