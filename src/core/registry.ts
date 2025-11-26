import { ICardProvider, ICuttingMachine, IDeckParser, IGame } from './types';

export class Registry<T> {
  protected items: Map<string, T> = new Map();

  register(key: string, item: T) {
    this.items.set(key, item);
  }

  get(key: string): T | undefined {
    return this.items.get(key);
  }

  getAll(): T[] {
    return Array.from(this.items.values());
  }
}

export class DeckParserRegistry extends Registry<IDeckParser> {
  detect(input: string): IDeckParser | undefined {
    // Find the first parser that claims it can parse the input
    return this.getAll().find(p => p.canParse(input));
  }
  
  getById(id: string): IDeckParser | undefined {
    return this.get(id);
  }
}

export const ProviderRegistry = new Registry<ICardProvider>();
export const ParserRegistry = new DeckParserRegistry();
export const MachineRegistry = new Registry<ICuttingMachine>();
export const GameRegistry = new Registry<IGame>();
