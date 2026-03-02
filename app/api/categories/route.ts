import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';
import { DataServiceError } from '@/types';
export const revalidate = 300;

export async function GET() {
  try {
    const dataService = DataService.getInstance();
    await dataService.initialize();

    // Get all categories
    const categories = await dataService.getAllCategories();

    const response = {
      categories,
      success: true
    };

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
