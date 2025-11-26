import { ICardProvider, Result, StandardCard, GameId } from '@/core/types';

type ApiResult<T> = {
  success: boolean;
  data?: T;
  error?: any;
}

export class ApiCardProvider implements ICardProvider {
  constructor(public gameId: GameId) {}

  private async handleResponse(response: Response): Promise<Result<StandardCard, Error>> {
    if (!response.ok) {
      return Result.fail(new Error(`API request failed with status ${response.status}`));
    }
    const json: ApiResult<StandardCard> = await response.json();
    if (json.success && json.data) {
      return Result.ok(json.data);
    } else {
      const errorMessage = json.error?.message || (typeof json.error === 'string' ? json.error : 'Unknown API error');
      return Result.fail(new Error(errorMessage));
    }
  }

  async search(query: string, set?: string, number?: string): Promise<Result<StandardCard, Error>> {
    try {
      let url = `/api/cards/search?gameId=${this.gameId}&q=${encodeURIComponent(query)}`;
      if (set) url += `&set=${encodeURIComponent(set)}`;
      if (number) url += `&number=${encodeURIComponent(number)}`;
      
      const response = await fetch(url);
      return this.handleResponse(response);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return Result.fail(new Error(`API Fetch Error: ${err.message}`));
    }
  }

  async getById(id: string): Promise<Result<StandardCard, Error>> {
    try {
      const response = await fetch(`/api/cards/${id}?gameId=${this.gameId}`);
      return this.handleResponse(response);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return Result.fail(new Error(`API Fetch Error: ${err.message}`));
    }
  }
}
