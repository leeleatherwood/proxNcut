import { CardSize, PaperSize } from '@/core/types';

export interface CardLayout {
  rows: number;
  cols: number;
}

export interface PaperLayout {
  width: number;
  height: number;
  card_layouts: Partial<Record<CardSize, CardLayout>>;
}

export interface LayoutConfig {
  card_sizes: Record<CardSize, { width: number; height: number; cornerRadiusMm: number }>;
  paper_layouts: Record<PaperSize, PaperLayout>;
}

export const LAYOUTS: LayoutConfig = {
    "card_sizes": {
        "mtg": { "width": 743, "height": 1038, "cornerRadiusMm": 3.175 },
        "mtg_double": { "width": 1487, "height": 1038, "cornerRadiusMm": 3.175 }
    },
    "paper_layouts": {
        "letter": {
            "width": 3300,
            "height": 2550,
            "card_layouts": {
                "mtg": { "rows": 2, "cols": 4 },
                "mtg_double": { "rows": 2, "cols": 2 }
            }
        },
        "a4": {
            "width": 3508,
            "height": 2480,
            "card_layouts": {
                "mtg": { "rows": 2, "cols": 4 },
                "mtg_double": { "rows": 2, "cols": 2 }
            }
        }
    }
};
