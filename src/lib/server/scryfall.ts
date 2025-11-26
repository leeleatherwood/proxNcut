import { Result, StandardCard } from '@/core/types';
import { logger } from '@/lib/logger';

interface ScryfallImageUris {
  small: string;
  normal: string;
  large: string;
  png: string;
  art_crop: string;
  border_crop: string;
}

interface ScryfallCardFace {
  object: string;
  name: string;
  mana_cost: string;
  type_line: string;
  oracle_text: string;
  colors: string[];
  power?: string;
  toughness?: string;
  image_uris?: ScryfallImageUris;
}

interface ScryfallCard {
  object: string;
  id: string;
  oracle_id: string;
  multiverse_ids: number[];
  name: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: string;
  highres_image: boolean;
  image_status: string;
  image_uris?: ScryfallImageUris;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  color_identity: string[];
  card_faces?: ScryfallCardFace[];
  set: string;
  set_name: string;
  collector_number: string;
  rarity: string;
}

export class ScryfallService {
  private static baseUrl = 'https://api.scryfall.com';

  private static mapToStandard(scryfall: ScryfallCard): StandardCard {
    // Handle double-faced cards
    let imageUrl = '';
    if (scryfall.image_uris) {
      imageUrl = scryfall.image_uris.png;
    } else if (scryfall.card_faces && scryfall.card_faces[0].image_uris) {
      imageUrl = scryfall.card_faces[0].image_uris.png;
    }

    return {
      id: scryfall.id,
      name: scryfall.name,
      set: scryfall.set,
      collectorNumber: scryfall.collector_number,
      imageUrl: imageUrl, // Remote URL
      widthMm: 63,
      heightMm: 88,
      quantity: 1,
      metadata: {
        scryfallId: scryfall.id,
      },
    };
  }

  static async search(query: string, set?: string, number?: string): Promise<Result<StandardCard, Error>> {
    try {
      let url = `${this.baseUrl}/cards/named?fuzzy=${encodeURIComponent(query)}`;
      
      // If we have specific set and number, use the direct endpoint
      if (set && number) {
        url = `${this.baseUrl}/cards/${set}/${number}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        // Fallback: If specific version fails, try fuzzy search by name
        if (set && number) {
            logger.warn(`Specific card ${set}/${number} not found, falling back to name search: ${query}`);
            return this.search(query);
        }
        return Result.fail(new Error(`Card not found: ${query}`));
      }
      
      const data = await response.json();
      return Result.ok(this.mapToStandard(data));
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      logger.error("Scryfall search error", error);
      return Result.fail(error);
    }
  }

  static async getById(id: string): Promise<Result<StandardCard, Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/cards/${id}`);
      if (!response.ok) return Result.fail(new Error(`Card not found: ${id}`));
      const data = await response.json();
      return Result.ok(this.mapToStandard(data));
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      logger.error("Scryfall getById error", error);
      return Result.fail(error);
    }
  }
}
