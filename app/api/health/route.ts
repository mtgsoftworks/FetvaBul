import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';
import { DataServiceError } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Initialize DataService and check health
    const dataService = DataService.getInstance();

    // Try to initialize and check database health
    let isHealthy = false;
    let dbStats = null;
    let errorMessage = '';

    try {
      await dataService.initialize();
      dbStats = await dataService.getStats();
      isHealthy = true;
    } catch (error) {
      isHealthy = false;
      errorMessage = error instanceof Error ? error.message : 'Database connection failed';
    }

    if (!isHealthy) {
      return NextResponse.json({
        status: 'unhealthy',
        message: errorMessage,
        database: 'disconnected',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'All systems operational',
      database: 'connected',
      stats: dbStats,
      timestamp: new Date().toISOString(),
      success: true
    });

  } catch (error) {
    console.error('Error checking health:', error);

    return NextResponse.json({
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error',
      database: 'error',
      timestamp: new Date().toISOString(),
      success: false
    }, { status: 500 });
  }
}