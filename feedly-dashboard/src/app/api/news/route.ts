import { NextRequest, NextResponse } from 'next/server';
import { fetchMultipleStreams } from '@/lib/feedly';
import { aggregateNews } from '@/lib/aggregate';
import { summarizeGroups } from '@/lib/summarize';
import { getConfig, validateConfig } from '@/lib/config';
import { getMockNewsResponse, isDemoMode } from '@/lib/mock-data';
import { NewsAPIResponse, StreamError, FeedlyItem } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const topN = parseInt(searchParams.get('topN') || '20', 10);
  const smartGroupingParam = searchParams.get('smartGrouping');
  const smartSummaryParam = searchParams.get('smartSummary');

  // Check if we should use demo mode (no credentials configured)
  if (isDemoMode()) {
    console.log('Running in DEMO MODE - using mock data');
    const mockResponse = getMockNewsResponse(topN);
    // Add demo mode indicator to metadata
    return NextResponse.json({
      ...mockResponse,
      metadata: {
        ...mockResponse.metadata,
        demoMode: true,
      },
    });
  }

  const config = getConfig();

  // Override config with query params if provided
  const useSmartGrouping = smartGroupingParam !== null
    ? smartGroupingParam === '1'
    : config.smartGrouping;
  const useSmartSummary = smartSummaryParam !== null
    ? smartSummaryParam === '1'
    : config.smartSummary;

  // Validate configuration
  const validation = validateConfig(config);
  if (!validation.valid) {
    return NextResponse.json(
      {
        error: 'Configuration error',
        details: validation.errors,
      },
      { status: 500 }
    );
  }

  try {
    // Fetch from all streams
    const results = await fetchMultipleStreams(
      config.feedlyStreamIds,
      config.feedlyToken,
      Math.max(50, Math.ceil(topN / config.feedlyStreamIds.length) * 2)
    );

    // Collect items and errors
    const allItems: FeedlyItem[] = [];
    const errors: StreamError[] = [];
    const streamsUsed: string[] = [];

    for (const result of results) {
      if (result.success && result.data) {
        allItems.push(...result.data.items);
        streamsUsed.push(result.streamId);
      } else {
        errors.push({
          streamId: result.streamId,
          error: result.error || 'Unknown error',
        });
      }
    }

    // If all streams failed, return error
    if (allItems.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          error: 'All streams failed to fetch',
          details: errors,
        },
        { status: 502 }
      );
    }

    // Aggregate
    const { items, grouped, dedupeCount } = aggregateNews(
      allItems,
      topN,
      useSmartGrouping
    );

    // Summarize
    const summarizedGroups = await summarizeGroups(
      grouped,
      useSmartSummary,
      config.anthropicApiKey
    );

    const response: NewsAPIResponse = {
      items,
      grouped: summarizedGroups,
      metadata: {
        streamsUsed,
        pulledAt: new Date().toISOString(),
        topN,
        dedupeCount,
        errorCount: errors.length,
        errors,
        smartGrouping: useSmartGrouping,
        smartSummary: useSmartSummary && !!config.anthropicApiKey,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
