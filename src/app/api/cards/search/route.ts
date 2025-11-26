import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';
import { ScryfallService } from '@/lib/server/scryfall';
import { Result } from '@/core/types';
import { withErrorHandler } from '@/lib/api-middleware';

export const GET = withErrorHandler(async (request: Request) => {
  const nextRequest = request as NextRequest;
  const searchParams = nextRequest.nextUrl.searchParams;
  const query = searchParams.get('q');
  const set = searchParams.get('set');
  const number = searchParams.get('number');
  const gameId = searchParams.get('gameId');

  if (!query) {
    return NextResponse.json(Result.fail(new Error('Missing query')), { status: 400 });
  }
  if (!gameId) {
    return NextResponse.json(Result.fail(new Error('Missing gameId')), { status: 400 });
  }

  // Construct a cache key that includes set/number if present
  let cacheKey = query;
  if (set && number) {
    cacheKey = `${query}|${set}|${number}`;
  }

  // 1. Check Local DB
  const localResult = await serverDb.getCardByQuery(gameId, cacheKey);
  if (localResult.success) {
    const localCard = localResult.value;
    // Inject source info into metadata
    const cardWithMeta = {
      ...localCard,
      metadata: { ...localCard.metadata, source: 'Local DB' }
    };
    return NextResponse.json(Result.ok(cardWithMeta));
  }

  // 2. Fetch Remote
  const cardResult = await ScryfallService.search(query, set || undefined, number || undefined);
  if (cardResult.isFailure()) {
    return NextResponse.json(Result.fail(cardResult.error?.message || 'Card not found'), { status: 404 });
  }

  const standardCard = cardResult.value;

  // 3. Save to DB (Downloads image)
  // Use the specific cacheKey so we can retrieve this specific version later
  const saveResult = await serverDb.saveCard(gameId, cacheKey, standardCard, standardCard.imageUrl);
  
  if (saveResult.isFailure()) {
      // If save fails, we still return the remote card, but maybe log the error
      // Or we can just return the remote card without local metadata
      console.error("Failed to save card to DB:", saveResult.error);
      return NextResponse.json(Result.ok(standardCard));
  }

  const savedCard = saveResult.value;
  
  const cardWithMeta = {
      ...savedCard,
      metadata: { ...savedCard.metadata, source: 'Remote API' }
  };

  return NextResponse.json(Result.ok(cardWithMeta));
});
