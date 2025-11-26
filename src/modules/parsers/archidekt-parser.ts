import { BaseLineParser } from './base-parser';
import { ParsedLineItem, GameId } from '@/core/types';

export class ArchidektParser extends BaseLineParser {
  id = 'mtg-archidekt';
  name = 'Archidekt';
  gameId: GameId = 'mtg';

  canParse(input: string): boolean {
    // Archidekt format: 1x Name (SET) 123 [Tags]
    // Key differentiator is the "1x" at start and (SET) code
    const regex = /^(\d+)x\s+(.+?)\s+\((.+?)\)\s+(\S+).*$/;
    return this.canParseWithRegex(input, regex);
  }

  protected parseLine(line: string): ParsedLineItem | null {
    // Regex: 
    // ^(\d+)x\s+       -> Quantity followed by 'x'
    // (.+?)            -> Name (lazy)
    // \s+\(            -> Space before Set
    // (.+?)            -> Set Code
    // \)\s+            -> Closing paren
    // (\S+)            -> Collector Number
    // .*$              -> Rest (Tags, etc)
    const match = line.match(/^(\d+)x\s+(.+?)\s+\((.+?)\)\s+(\S+).*$/);

    if (match) {
      return {
        raw: line,
        quantity: parseInt(match[1], 10),
        name: match[2].trim(),
        set: match[3].toLowerCase(),
        number: match[4]
      };
    } else {
      // Fallback or ignore? 
      // If it doesn't match strict Archidekt, maybe it's a simple line?
      // But for this parser, we expect the format.
      // Let's try to parse simple "1x Name" just in case mixed
      const simpleMatch = line.match(/^(\d+)x?\s+(.+)$/);
      if (simpleMatch) {
           return {
              raw: line,
              quantity: parseInt(simpleMatch[1], 10),
              name: simpleMatch[2].trim(),
           };
      }
    }
    return null;
  }
}
