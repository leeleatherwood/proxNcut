import { z } from 'zod';

// --- Enums ---
export type CardSize = 
  | 'mtg' 
  | 'mtg_double';

export type PaperSize = 'letter' | 'a4';

export type MachineId = 'silhouette' | 'hand';
export type GameId = 'mtg';

// --- Result Pattern ---
export class Result<T, E = Error> {
  public readonly success: boolean;
  public readonly error: E | undefined;
  public readonly data: T | undefined;

  private constructor(success: boolean, data?: T, error?: E) {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  public static ok<U>(data: U): Result<U, never> {
    return new Result(true, data, undefined as never);
  }

  public static fail<U>(error: U): Result<never, U> {
    return new Result(false, undefined as never, error);
  }

  public isFailure(): this is Result<never, E> {
    return !this.success;
  }

  public get value(): T {
    if (this.isFailure()) {
      throw new Error("Cannot get the value of a failed result.");
    }
    return this.data as T;
  }

  public toJSON() {
    return {
      success: this.success,
      data: this.data,
      error: this.error instanceof Error ? { message: this.error.message } : this.error
    };
  }
}

// --- Domain Models ---

export const StandardCardSchema = z.object({
  id: z.string(), // Unique ID (e.g., Scryfall ID or generated)
  name: z.string(),
  set: z.string().optional(),
  collectorNumber: z.string().optional(),
  imageUrl: z.string().url(),
  widthMm: z.number(),
  heightMm: z.number(),
  quantity: z.number().min(1).default(1),
  metadata: z.record(z.string(), z.any()).optional(), // For game-specific data
});

export type StandardCard = z.infer<typeof StandardCardSchema>;

export interface StandardDecklist {
  cards: StandardCard[];
  game: GameId;
}

// --- Interfaces ---

export interface IGame {
  id: GameId;
  name: string;
  defaultCardSize: CardSize;
}

export interface ICardProvider {
  gameId: GameId;
  search(query: string, set?: string, number?: string): Promise<Result<StandardCard, Error>>;
  getById(id: string): Promise<Result<StandardCard, Error>>;
}

export interface IDeckParser {
  id: string;
  name: string;
  gameId: GameId;
  canParse(input: string): boolean; // Auto-detection logic
  parse(input: string): Promise<Result<ParsedLineItem[], Error>>;
}

export interface ParsedLineItem {
  raw: string;
  quantity: number;
  name: string;
  set?: string;
  number?: string;
}

export interface ICuttingMachine {
  id: MachineId;
  name: string;
  bleedMm: number; // The amount of bleed this machine expects (e.g., 2mm)
  
  calculateLayout(
    decklist: StandardDecklist, 
    paperSize: PaperSize, 
    cardSize: CardSize,
    options?: { avoidRegistrationMarks?: boolean }
  ): Promise<LayoutResult>;

  getRegistrationTemplate(paperSize: PaperSize): string | null; // Returns URL to background image
  
  // Draw registration marks on the canvas (for machines that generate them dynamically)
  renderRegistrationMarks?(ctx: CanvasRenderingContext2D, paperWidth: number, paperHeight: number): void;

  // Optional: Draw custom overlays (like cut lines) on the canvas
  renderOverlays?(ctx: CanvasRenderingContext2D, page: LayoutPage, paperWidth: number, paperHeight: number, cardSize?: CardSize): void;

  generateCutFile(layout: LayoutResult): Promise<Blob>;
}

export interface LayoutPage {
  pageNumber: number;
  items: {
    cardId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }[];
}

export interface LayoutResult {
  pages: LayoutPage[];
  totalCards: number;
  paperWidth: number;
  paperHeight: number;
  cardSize: CardSize;
}
