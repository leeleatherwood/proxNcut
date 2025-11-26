import { BaseLineParser } from './base-parser';
import { ParsedLineItem, GameId } from '@/core/types';

export class MoxfieldParser extends BaseLineParser {
  id = 'mtg-moxfield';
  name = 'Moxfield';
  gameId: GameId = 'mtg';

  canParse(input: string): boolean {
    // Moxfield Format: "1 Card Name (SET) 123 *F*"
    const regex = /^(\d+)\s+(.+?)\s+\(([A-Z0-9]{3,})\)\s+(\S+).*$/i;
    return this.canParseWithRegex(input, regex);
  }

  protected parseLine(line: string): ParsedLineItem | null {
    // Regex breakdown:
    // ^(\d+)\s+        -> Quantity
    // (.+?)            -> Name (lazy match)
    // \s+\(            -> Space before Set
    // ([A-Z0-9]{3,})   -> Set Code
    // \)\s+            -> Closing paren
    // (\S+)            -> Collector Number
    // .*$              -> Flags/Extras (like *F*)
    const match = line.match(/^(\d+)\s+(.+?)\s+\(([A-Z0-9]{3,})\)\s+(\S+).*$/i);

    if (match) {
      return {
        raw: line,
        quantity: parseInt(match[1], 10),
        name: match[2].trim(),
        set: match[3].toLowerCase(),
        number: match[4]
      };
    }
    return null;
  }
}
