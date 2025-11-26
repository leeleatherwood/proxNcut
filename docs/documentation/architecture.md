# Architecture Overview

proxNcut is built on a modular **Plugin/Adapter Architecture** designed to be game-agnostic and easily extensible. This document outlines the core architectural patterns and data flow.

## Core Design Patterns

### 1. Registry Pattern
The heart of the application is the **Registry System**. Instead of hardcoding support for specific games or machines, the core application queries registries to find the appropriate handler for a task.

```typescript
// Core Registries
export const ProviderRegistry = new Registry<ICardProvider>();
export const ParserRegistry = new DeckParserRegistry();
export const MachineRegistry = new Registry<ICuttingMachine>();
export const GameRegistry = new Registry<IGame>();
```

This allows the application to:
- **Auto-detect** decklist formats by querying all registered parsers.
- **Dynamically load** the correct data provider based on the game ID.
- **Switch** between cutting machines at runtime.

### 2. Service Layer
Business logic is encapsulated in **Services**, which act as the bridge between the UI (React components) and the Core/Module layers.

- **`DeckService`**: Orchestrates the parsing of text input and the fetching of card data. It handles the "Business Logic" of turning a string into a list of `StandardCard` objects.
- **`MachineService`**: Orchestrates layout calculation and file generation. It abstracts the complexity of different machine requirements from the UI.

Services use **Dependency Injection** for their dependencies (registries), making them highly testable.

### 3. Result Pattern
To ensure robust error handling, the application uses a functional `Result<T, E>` pattern instead of throwing exceptions for expected failures.

```typescript
export class Result<T, E = Error> {
  public readonly success: boolean;
  public readonly data: T | undefined;
  public readonly error: E | undefined;
  // ...
}
```

This forces consumers to handle both success and failure cases explicitly.

## Layered Architecture

The application follows a strict layered approach:

```
┌─────────────────────────────────────────────────┐
│ Presentation Layer (React Components)          │
│ - LeftPanel, RightPanel, CenterPanel           │
│ - Uses ServiceContext to access logic          │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ Service Layer (Business Logic)                 │
│ - DeckService                                  │
│ - MachineService                               │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ Core Layer (Interfaces & Registries)           │
│ - ICardProvider, IDeckParser, ICuttingMachine  │
│ - Registry<T>                                  │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ Module Layer (Implementations)                 │
│ - Parsers: Archidekt, Moxfield, etc.           │
│ - Machines: Silhouette, HandCut                │
│ - Providers: ApiCardProvider                   │
└─────────────────────────────────────────────────┘
```

## Data Flow

### 1. Deck Import Flow
1.  User pastes text into the UI.
2.  `DeckService` asks `ParserRegistry` to find a parser that `canParse(input)`.
3.  The matching `IDeckParser` converts the text into `ParsedLineItem[]`.
4.  `DeckService` identifies the `GameId` from the parser.
5.  `DeckService` gets the corresponding `ICardProvider` from `ProviderRegistry`.
6.  `DeckService` fetches `StandardCard` data for each item using the provider.
7.  Resulting cards are stored in the `DeckStore` (Zustand).

### 2. Layout & Export Flow
1.  User selects a machine and paper size in the UI.
2.  `MachineService` retrieves the `ICuttingMachine` from `MachineRegistry`.
3.  `MachineService` calls `machine.calculateLayout()` with the decklist.
4.  The machine returns a `LayoutResult` (pages, coordinates, dimensions).
5.  **Preview**: The UI renders this layout to an HTML Canvas.
6.  **Export**: `MachineService` calls `machine.generateCutFile()` or uses `pdf-utils` to generate a PDF.
