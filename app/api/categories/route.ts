<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';
import { DataServiceError } from '@/types';
export const revalidate = 300;

export async function GET() {
  try {
=======
import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';
import { DataServiceError } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';

>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
    const dataService = DataService.getInstance();
    await dataService.initialize();

    // Get all categories
    const categories = await dataService.getAllCategories();

<<<<<<< HEAD
    const response = {
=======
    let response: any = {
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
      categories,
      success: true
    };

<<<<<<< HEAD
=======
    // Include additional statistics if requested
    if (includeStats) {
      response.stats = await dataService.getStats();
    }

>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
