import { BaseLineParser } from './base-parser';
import { ParsedLineItem, GameId } from '@/core/types';

export class MtgStandardParser extends BaseLineParser {
  id = 'mtg-mtgo';
  name = 'MTGO';
  gameId: GameId = 'mtg';

  canParse(input: string): boolean {
    // Standard/MTGO: 4 Lightning Bolt
    const standardRegex = /^(\d+)[x\s]+(.+)$/;
    return this.canParseWithRegex(input, standardRegex);
  }

  protected parseLine(line: string): ParsedLineItem | null {
    // Standard Format: "4 Lightning Bolt" or "1x Black Lotus"
    const standardMatch = line.match(/^(\d+)[x\s]+(.+)$/);
    if (standardMatch) {
      return {
        raw: line,
        quantity: parseInt(standardMatch[1], 10),
        name: standardMatch[2].trim(),
      };
    }

    // Fallback: Assume 1 if no number, but ignore empty/short lines
    if (line.length > 1) {
      return {
        raw: line,
        quantity: 1,
        name: line,
      };
    }
    return null;
  }
}

export class MtgPlaintextParser extends MtgStandardParser {
  id = 'mtg-plaintext';
  name = 'Plaintext';
  
  // Reuse logic, but maybe lower priority for auto-detect?
  // Since auto-detect finds the first one, and we register this second, it works out.
}
