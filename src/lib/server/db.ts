import path from 'path';
import { StandardCard, Result } from '@/core/types';
import { CardStorage } from './storage/card-storage';
import { ImageDownloader } from './downloader/image-downloader';

const DATA_DIR = path.join(process.cwd(), 'data');
const PUBLIC_IMG_DIR = path.join(process.cwd(), 'public', 'images', 'cards');
const CARDS_FILE = path.join(DATA_DIR, 'cards.json');
const QUERIES_FILE = path.join(DATA_DIR, 'queries.json');

class ServerDatabase {
  private storage: CardStorage;
  private downloader: ImageDownloader;

  constructor() {
    this.storage = new CardStorage(DATA_DIR, CARDS_FILE, QUERIES_FILE);
    this.downloader = new ImageDownloader(PUBLIC_IMG_DIR);
  }

  async getCard(id: string): Promise<Result<StandardCard, Error>> {
    const card = await this.storage.getCard(id);
    if (card) {
      return Result.ok(card);
    }
    return Result.fail(new Error(`Card not found in DB: ${id}`));
  }

  async getCardByQuery(gameId: string, query: string): Promise<Result<StandardCard, Error>> {
    const key = `${gameId}:${query.toLowerCase()}`;
    const card = await this.storage.getCardByQuery(key);
    if (card) {
      return Result.ok(card);
    }
    return Result.fail(new Error(`Card not found in DB for query: ${query}`));
  }

  async saveCard(gameId: string, query: string | null, card: StandardCard, imageUrl: string): Promise<Result<StandardCard, Error>> {
    try {
      // 1. Download and Save Image
      const imageFileName = `${card.id}.png`; // Assume PNG for now
      const savedFilename = await this.downloader.download(imageUrl, imageFileName);
      
      let publicUrl = imageUrl; // Fallback to remote
      if (savedFilename) {
        publicUrl = `/images/cards/${savedFilename}`;
      }

      // 2. Update Card Object with Local URL
      const localCard = {
        ...card,
        imageUrl: publicUrl
      };

      // 3. Save to Storage
      await this.storage.saveCard(localCard);
      
      if (query) {
        const key = `${gameId}:${query.toLowerCase()}`;
        await this.storage.saveQueryMapping(key, card.id);
      }

      return Result.ok(localCard);
    } catch (e) {
      return Result.fail(e instanceof Error ? e : new Error(String(e)));
    }
  }
}

export const serverDb = new ServerDatabase();
