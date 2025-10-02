import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';
import { DataServiceError } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Initialize DataService
    const dataService = DataService.getInstance();
    await dataService.initialize();

    const { slug } = params;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid category slug' },
        { status: 400 }
      );
    }

    // Validate parameters
    if (limit > 100) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 100' },
        { status: 400 }
      );
    }

    if (page < 1) {
      return NextResponse.json(
        { error: 'Page must be greater than 0' },
        { status: 400 }
      );
    }

    // Get category by slug
    const category = await dataService.getCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Get fatwas by category name
    const offset = (page - 1) * limit;
    const fatwas = await dataService.search({
      query: '',
      category: category.name,
      limit,
      offset,
      sortBy: 'date'
    });

    return NextResponse.json({
      category,
      fatwas: fatwas.map(result => result.fetva),
      pagination: {
        page,
        limit,
        total: category.fatwaCount || 0,
        totalPages: Math.ceil((category.fatwaCount || 0) / limit)
      },
      success: true
    });

  } catch (error) {
    console.error('Error fetching category fatwas:', error);

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