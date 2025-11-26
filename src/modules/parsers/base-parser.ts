import { IDeckParser, ParsedLineItem, Result, GameId } from '@/core/types';
import { LAYOUT_CONSTANTS } from '@/config/constants';

export abstract class BaseLineParser implements IDeckParser {
  abstract id: string;
  abstract name: string;
  abstract gameId: GameId;

  abstract canParse(input: string): boolean;

  protected canParseWithRegex(input: string, regex: RegExp, lineCount = LAYOUT_CONSTANTS.CORNER_DETECTION_LINES): boolean {
    const lines = input.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) return false;
    
    return lines.slice(0, lineCount).some(line => {
      const trimmed = line.trim();
      if (trimmed.endsWith(':')) return false;
      return regex.test(trimmed);
    });
  }

  protected abstract parseLine(line: string): ParsedLineItem | null;

  async parse(input: string): Promise<Result<ParsedLineItem[], Error>> {
    const lines = input.split('\n').filter((l) => l.trim() !== '');
    const parsedItems: ParsedLineItem[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Common skip logic
      if (trimmed.endsWith(':') || !trimmed) continue;
      if (['deck', 'sideboard', 'commander', 'maybeboard', 'main'].includes(trimmed.toLowerCase())) continue;

      const item = this.parseLine(trimmed);
      if (item) {
        parsedItems.push(item);
      }
    }

    return Result.ok(parsedItems);
  }
}
