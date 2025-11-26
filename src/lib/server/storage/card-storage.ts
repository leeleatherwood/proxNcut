import fs from 'fs/promises';
import { StandardCard } from '@/core/types';

type CardDb = Record<string, StandardCard>;
type QueryDb = Record<string, string>; // "gameId:query" -> cardId

export class CardStorage {
  private cards: CardDb = {};
  private queries: QueryDb = {};
  private initialized = false;

  constructor(
    private dataDir: string,
    private cardsFile: string,
    private queriesFile: string
  ) {}

  private async ensureDir() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  async init() {
    if (this.initialized) return;
    await this.ensureDir();

    try {
      const cardsData = await fs.readFile(this.cardsFile, 'utf-8');
      this.cards = JSON.parse(cardsData);
    } catch {
      this.cards = {};
    }

    try {
      const queriesData = await fs.readFile(this.queriesFile, 'utf-8');
      this.queries = JSON.parse(queriesData);
    } catch {
      this.queries = {};
    }

    this.initialized = true;
  }

  async save() {
    await fs.writeFile(this.cardsFile, JSON.stringify(this.cards, null, 2));
    await fs.writeFile(this.queriesFile, JSON.stringify(this.queries, null, 2));
  }

  async getCard(id: string): Promise<StandardCard | null> {
    await this.init();
    return this.cards[id] || null;
  }

  async getCardByQuery(key: string): Promise<StandardCard | null> {
    await this.init();
    const id = this.queries[key];
    if (!id) return null;
    return this.cards[id] || null;
  }

  async saveCard(card: StandardCard): Promise<void> {
    await this.init();
    this.cards[card.id] = card;
    await this.save();
  }

  async saveQueryMapping(key: string, cardId: string): Promise<void> {
    await this.init();
    this.queries[key] = cardId;
    await this.save();
  }
}
