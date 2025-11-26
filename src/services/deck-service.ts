import { ParserRegistry, ProviderRegistry, DeckParserRegistry, Registry } from '@/core/registry';
import { StandardCard, Result, ICardProvider } from '@/core/types';

export interface ProcessResult {
  success: boolean;
  cards: StandardCard[];
  logs: string[];
}

export class DeckService {
  constructor(
    private parserRegistry: DeckParserRegistry = ParserRegistry,
    private providerRegistry: Registry<ICardProvider> = ProviderRegistry
  ) {}

  async processDecklist(
    input: string, 
    parserId: string = 'auto',
    onLog?: (msg: string) => void
  ): Promise<ProcessResult> {
    const logs: string[] = [];
    const log = (msg: string) => {
      logs.push(msg);
      onLog?.(msg);
    };

    log('> Starting process...');

    // 1. Select Parser
    let parser;
    if (parserId === 'auto') {
      log('Auto-detecting parser...');
      parser = this.parserRegistry.detect(input);
      if (parser) {
        log(`Detected parser: ${parser.name}`);
      } else {
        log('Error: Could not auto-detect format.');
        return { success: false, cards: [], logs };
      }
    } else {
      parser = this.parserRegistry.getById(parserId);
    }

    if (!parser) {
      log('Error: Parser not found');
      return { success: false, cards: [], logs };
    }

    log(`Using parser: ${parser.name}`);

    // 2. Select Provider
    const provider = this.providerRegistry.get(parser.gameId);
    if (!provider) {
      log('Error: Provider not found');
      return { success: false, cards: [], logs };
    }

    // 3. Parse Input
    log('Parsing input...');
    const parseResult = await parser.parse(input);
    if (parseResult.isFailure()) {
      log(`Error: ${parseResult.error?.message ?? 'Unknown parsing error'}`);
      return { success: false, cards: [], logs };
    }

    const parsedItems = parseResult.value;

    // 4. Fetch Cards
    log(`Found ${parsedItems.length} cards. Starting parallel fetch (4 threads)...`);
    
    const queue = [...parsedItems];
    const concurrency = 4;
    let completed = 0;
    const loadedCards: StandardCard[] = [];

    const worker = async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;

        const cardResult = await provider.search(item.name, item.set, item.number);
        
        if (cardResult.success) {
          const card = cardResult.value;
          card.quantity = item.quantity;
          loadedCards.push(card);
          const source = card.metadata?.source ? ` [${card.metadata.source}]` : '';
          log(`[${++completed}/${parsedItems.length}] Loaded: ${card.name}${source}`);
        } else {
          log(`[${++completed}/${parsedItems.length}] Failed: ${item.name} - ${cardResult.error?.message ?? 'Unknown error'}`);
        }
      }
    };

    const workers = Array(concurrency).fill(null).map(() => worker());
    await Promise.all(workers);

    log('Done.');
    return { success: true, cards: loadedCards, logs };
  }

  getAvailableParsers() {
    return this.parserRegistry.getAll();
  }
}

export const deckService = new DeckService();
