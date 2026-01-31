import { FeedlyStreamResponseSchema, FeedlyStreamResponse, FeedlyItem } from '@/types';

const FEEDLY_API_BASE = 'https://cloud.feedly.com/v3';

interface FetchStreamOptions {
  streamId: string;
  token: string;
  count?: number;
  continuation?: string;
}

interface FetchStreamResult {
  success: boolean;
  data?: FeedlyStreamResponse;
  error?: string;
  streamId: string;
}

/**
 * Fetch a single stream's contents from Feedly API
 */
export async function fetchStream({
  streamId,
  token,
  count = 50,
  continuation,
}: FetchStreamOptions): Promise<FetchStreamResult> {
  const params = new URLSearchParams({
    streamId: streamId,
    count: count.toString(),
  });

  if (continuation) {
    params.append('continuation', continuation);
  }

  const url = `${FEEDLY_API_BASE}/streams/contents?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        streamId,
      };
    }

    const json = await response.json();
    const parsed = FeedlyStreamResponseSchema.safeParse(json);

    if (!parsed.success) {
      return {
        success: false,
        error: `Invalid response format: ${parsed.error.message}`,
        streamId,
      };
    }

    return {
      success: true,
      data: parsed.data,
      streamId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      streamId,
    };
  }
}

/**
 * Fetch all items from a stream with pagination
 */
export async function fetchAllStreamItems(
  streamId: string,
  token: string,
  maxItems: number = 100
): Promise<FetchStreamResult> {
  const allItems: FeedlyItem[] = [];
  let continuation: string | undefined;
  let lastResponse: FeedlyStreamResponse | undefined;

  while (allItems.length < maxItems) {
    const remaining = maxItems - allItems.length;
    const count = Math.min(remaining, 100);

    const result = await fetchStream({
      streamId,
      token,
      count,
      continuation,
    });

    if (!result.success || !result.data) {
      if (allItems.length > 0 && lastResponse) {
        // Return partial results if we have some
        return {
          success: true,
          data: { ...lastResponse, items: allItems },
          streamId,
        };
      }
      return result;
    }

    allItems.push(...result.data.items);
    lastResponse = result.data;
    continuation = result.data.continuation;

    if (!continuation) break;
  }

  return {
    success: true,
    data: lastResponse ? { ...lastResponse, items: allItems } : undefined,
    streamId,
  };
}

/**
 * Fetch multiple streams in parallel
 */
export async function fetchMultipleStreams(
  streamIds: string[],
  token: string,
  itemsPerStream: number = 50
): Promise<FetchStreamResult[]> {
  const promises = streamIds.map((streamId) =>
    fetchAllStreamItems(streamId, token, itemsPerStream)
  );

  return Promise.all(promises);
}

/**
 * Extract canonical URL from Feedly item
 */
export function extractUrl(item: FeedlyItem): string {
  // Prefer alternate[0].href
  if (item.alternate && item.alternate.length > 0) {
    return item.alternate[0].href;
  }
  // Fallback to originId
  if (item.originId) {
    // originId is sometimes a URL
    if (item.originId.startsWith('http')) {
      return item.originId;
    }
  }
  return '';
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

/**
 * Normalize URL for deduplication
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'source'];
    trackingParams.forEach((param) => parsed.searchParams.delete(param));
    // Normalize
    let normalized = `${parsed.hostname}${parsed.pathname}`.toLowerCase();
    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');
    return normalized;
  } catch {
    return url.toLowerCase();
  }
}
