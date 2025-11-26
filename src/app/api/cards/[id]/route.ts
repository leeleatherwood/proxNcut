import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';
import { ScryfallService } from '@/lib/server/scryfall';
import { Result } from '@/core/types';
import { withErrorHandler } from '@/lib/api-middleware';

export const GET = withErrorHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const nextRequest = request as NextRequest;
  const searchParams = nextRequest.nextUrl.searchParams;
  const gameId = searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json(Result.fail(new Error('Missing gameId')), { status: 400 });
  }

  // 1. Check Local DB
  const localResult = await serverDb.getCard(id);
  if (localResult.success) {
    return NextResponse.json(Result.ok(localResult.value));
  }

  // 2. Fetch Remote
  const cardResult = await ScryfallService.getById(id);
  if (cardResult.isFailure()) {
    return NextResponse.json(Result.fail(cardResult.error?.message || 'Card not found'), { status: 404 });
  }
  const standardCard = cardResult.value;

  // 3. Save to DB (Downloads image)
  // Note: We don't have a query string here, so we pass null for query
  const saveResult = await serverDb.saveCard(gameId, null, standardCard, standardCard.imageUrl);
  
  if (saveResult.isFailure()) {
      console.error("Failed to save card to DB:", saveResult.error);
      return NextResponse.json(Result.ok(standardCard));
  }

  return NextResponse.json(Result.ok(saveResult.value));
});
