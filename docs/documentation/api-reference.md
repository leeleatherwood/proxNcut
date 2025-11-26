# API Reference

This document details the core interfaces and types used in the proxNcut ecosystem.

## Core Types

### `StandardCard`
The canonical representation of a card in the system.

```typescript
export interface StandardCard {
  id: string;           // Unique ID (e.g., Scryfall ID)
  name: string;         // Card Name
  set?: string;         // Set Code (e.g., 'lea')
  collectorNumber?: string;
  imageUrl: string;     // High-res image URL
  widthMm: number;      // Physical width in mm
  heightMm: number;     // Physical height in mm
  quantity: number;     // Number of copies in deck
  metadata?: Record<string, any>; // Game-specific extra data
}
```

### `StandardDecklist`
Represents the current state of the user's deck.

```typescript
export interface StandardDecklist {
  cards: StandardCard[];
  game: GameId;
}
```

### `LayoutResult`
The output of a machine's layout calculation.

```typescript
export interface LayoutResult {
  pages: LayoutPage[];
  totalCards: number;
  paperWidth: number;   // In pixels (300 DPI)
  paperHeight: number;  // In pixels (300 DPI)
  cardSize: CardSize;
}

export interface LayoutPage {
  pageNumber: number;
  items: {
    cardId: string;
    x: number;          // Top-Left X (pixels)
    y: number;          // Top-Left Y (pixels)
    width: number;      // Width (pixels)
    height: number;     // Height (pixels)
    rotation: number;   // Rotation in degrees
  }[];
}
```

## Interfaces

### `ICardProvider`
Fetches card data from an external source.

```typescript
export interface ICardProvider {
  gameId: GameId;
  search(query: string, set?: string, number?: string): Promise<Result<StandardCard, Error>>;
  getById(id: string): Promise<Result<StandardCard, Error>>;
}
```

### `IDeckParser`
Parses text input into structured data.

```typescript
export interface IDeckParser {
  id: string;
  name: string;
  gameId: GameId;
  canParse(input: string): boolean;
  parse(input: string): Promise<Result<ParsedLineItem[], Error>>;
}
```

### `ICuttingMachine`
Handles layout logic and cut file generation.

```typescript
export interface ICuttingMachine {
  id: MachineId;
  name: string;
  bleedMm: number;
  
  calculateLayout(
    decklist: StandardDecklist, 
    paperSize: PaperSize, 
    cardSize: CardSize,
    options?: { avoidRegistrationMarks?: boolean }
  ): Promise<LayoutResult>;

  generateCutFile(layout: LayoutResult): Promise<Blob>;
}
```
