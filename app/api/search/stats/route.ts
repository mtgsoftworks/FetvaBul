import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';
import { DataServiceError } from '@/types';

export async function GET() {
  try {
    const dataService = DataService.getInstance();
    await dataService.initialize();

    const stats = await dataService.getSearchStats();

    return NextResponse.json({
      stats,
      success: true
    });
  } catch (error) {
    console.error('Error fetching search stats:', error);

    if (error instanceof DataServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
