import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';
import { DataServiceError } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Initialize DataService
    const dataService = DataService.getInstance();
    await dataService.initialize();

    const { id } = params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid fatwa ID' },
        { status: 400 }
      );
    }

    // Get the fatwa
    const fatwa = await dataService.getFetvaById(id);

    if (!fatwa) {
      return NextResponse.json(
        { error: 'Fatwa not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await dataService.incrementViews(id);

    // Get related fatwas (using similar questions functionality)
    const relatedFatwas = await dataService.findSimilarQuestions(fatwa.question, 5);

    return NextResponse.json({
      fatwa,
      relatedFatwas,
      success: true
    });

  } catch (error) {
    console.error('Error fetching fatwa:', error);

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