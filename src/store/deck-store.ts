import { create } from 'zustand';
import { StandardCard, StandardDecklist, GameId } from '@/core/types';

interface DeckState {
  decklist: StandardDecklist;
  isFetching: boolean;
  addCard: (card: StandardCard) => void;
  removeCard: (cardId: string) => void;
  clearDeck: () => void;
  setGame: (gameId: GameId) => void;
  setFetching: (isFetching: boolean) => void;
}

export const useDeckStore = create<DeckState>((set) => ({
  decklist: {
    cards: [],
    game: 'mtg', // Default
  },
  isFetching: false,
  addCard: (card) =>
    set((state) => {
      const existing = state.decklist.cards.find((c) => c.id === card.id);
      if (existing) {
        // Update quantity
        return {
          decklist: {
            ...state.decklist,
            cards: state.decklist.cards.map((c) =>
              c.id === card.id ? { ...c, quantity: c.quantity + card.quantity } : c
            ),
          },
        };
      }
      return {
        decklist: {
          ...state.decklist,
          cards: [...state.decklist.cards, card],
        },
      };
    }),
  removeCard: (cardId) =>
    set((state) => ({
      decklist: {
        ...state.decklist,
        cards: state.decklist.cards.filter((c) => c.id !== cardId),
      },
    })),
  clearDeck: () =>
    set((state) => ({
      decklist: { ...state.decklist, cards: [] },
    })),
  setGame: (gameId) =>
    set((state) => ({
      decklist: { ...state.decklist, game: gameId },
    })),
  setFetching: (isFetching) => set({ isFetching }),
}));
