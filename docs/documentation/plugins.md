# Plugin Development Guide

proxNcut is designed to be extended. This guide explains how to create new plugins to support additional games, deck formats, or cutting machines.

## 1. Adding a New Game

To add support for a new game (e.g., Pokémon), you need to define it and register it.

### Step 1: Define the Game
Create a new file `src/modules/games/pokemon-game.ts`:

```typescript
import { IGame } from '@/core/types';

export const PokemonGame: IGame = {
  id: 'pokemon',
  name: 'Pokémon TCG',
  defaultCardSize: 'pokemon', // You'll need to add this to CardSize type
};
```

### Step 2: Register the Game
In `src/config/plugins.ts`:

```typescript
GameRegistry.register(PokemonGame.id, PokemonGame);
```

---

## 2. Adding a New Provider

Providers fetch card data. If you want to support a new game, you likely need a new provider.

### Step 1: Implement `ICardProvider`
Create `src/modules/providers/pokemon-provider.ts`:

```typescript
import { ICardProvider, Result, StandardCard, GameId } from '@/core/types';

export class PokemonCardProvider implements ICardProvider {
  gameId: GameId = 'pokemon';

  async search(query: string, set?: string, number?: string): Promise<Result<StandardCard, Error>> {
    // Implement API call to Pokémon TCG API
    // Map response to StandardCard format
  }

  async getById(id: string): Promise<Result<StandardCard, Error>> {
    // ...
  }
}
```

### Step 2: Register the Provider
In `src/config/plugins.ts`:

```typescript
ProviderRegistry.register('pokemon', new PokemonCardProvider());
```

---

## 3. Adding a New Parser

Parsers allow the app to read decklists from different websites or formats.

### Step 1: Implement `IDeckParser`
Extend `BaseLineParser` for easier implementation.

```typescript
import { BaseLineParser } from './base-parser';
import { ParsedLineItem, GameId } from '@/core/types';

export class PokemonTcgPlayerParser extends BaseLineParser {
  id = 'pokemon-tcgplayer';
  name = 'TCGPlayer (Pokémon)';
  gameId: GameId = 'pokemon';

  canParse(input: string): boolean {
    // Return true if input looks like this format
    return input.includes('Pokemon'); 
  }

  protected parseLine(line: string): ParsedLineItem | null {
    // Regex logic to extract quantity, name, set, number
    return {
        quantity: 1,
        name: 'Pikachu',
        // ...
    };
  }
}
```

### Step 2: Register the Parser
In `src/config/plugins.ts`:

```typescript
const parser = new PokemonTcgPlayerParser();
ParserRegistry.register(parser.id, parser);
```

---

## 4. Adding a New Cutting Machine

To support a new cutter (e.g., Cricut), implement `ICuttingMachine`.

### Step 1: Implement `ICuttingMachine`
Extend `BaseCuttingMachine` to inherit standard grid layout logic.

```typescript
import { BaseCuttingMachine } from './base-machine';
import { LayoutResult, MachineId } from '@/core/types';

export class CricutMachine extends BaseCuttingMachine {
  id: MachineId = 'cricut'; // Add to MachineId type
  name = 'Cricut Maker';
  bleedMm = 1.0;

  getRegistrationTemplate(paperSize: PaperSize): string | null {
    // Return URL to background image if needed
    return null; 
  }

  async generateCutFile(layout: LayoutResult): Promise<Blob> {
    // Generate SVG for Cricut Design Space
    const svgContent = this.createSvg(layout);
    return new Blob([svgContent], { type: 'image/svg+xml' });
  }
}
```

### Step 2: Register the Machine
In `src/config/plugins.ts`:

```typescript
MachineRegistry.register('cricut', new CricutMachine());
```
