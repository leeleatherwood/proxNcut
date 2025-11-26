import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

type ApiHandler = (req: Request, ...args: any[]) => Promise<NextResponse>;

export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      logger.error('API Error:', error);
      
      const message = error instanceof Error ? error.message : 'Internal Server Error';
      
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  };
}
