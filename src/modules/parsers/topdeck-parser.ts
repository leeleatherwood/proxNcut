import { BaseLineParser } from './base-parser';
import { ParsedLineItem, GameId } from '@/core/types';

export class TopdeckParser extends BaseLineParser {
  id = 'mtg-topdeck';
  name = 'Topdeck.gg';
  gameId: GameId = 'mtg';

  canParse(input: string): boolean {
    const lines = input.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) return false;

    // Topdeck.gg uses ~~Header~~ format
    // We check if ANY line matches this pattern to identify the format
    return lines.some(line => line.trim().startsWith('~~') && line.trim().endsWith('~~'));
  }

  protected parseLine(line: string): ParsedLineItem | null {
    const trimmed = line.trim();
    
    // Skip headers like ~~Commanders~~
    if (trimmed.startsWith('~~')) return null;

    // Format: "1 Card Name" or "1 Card Name // Split Name"
    // Regex: Start with number, space, then rest is name
    const match = trimmed.match(/^(\d+)\s+(.+)$/);

    if (match) {
      return {
        raw: trimmed,
        quantity: parseInt(match[1], 10),
        name: match[2].trim(),
      };
    }
    
    return null;
  }
}
