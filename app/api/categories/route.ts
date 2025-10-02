import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';
import { DataServiceError } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';

    const dataService = DataService.getInstance();
    await dataService.initialize();

    // Get all categories
    const categories = await dataService.getAllCategories();

    let response: any = {
      categories,
      success: true
    };

    // Include additional statistics if requested
    if (includeStats) {
      response.stats = await dataService.getStats();
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching categories:', error);

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