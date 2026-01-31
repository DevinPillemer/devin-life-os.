import { z } from 'zod';

// Feedly API response schemas
export const FeedlyAlternateSchema = z.object({
  href: z.string(),
  type: z.string().optional(),
});

export const FeedlyOriginSchema = z.object({
  streamId: z.string(),
  title: z.string().optional(),
  htmlUrl: z.string().optional(),
});

export const FeedlyItemSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  published: z.number().optional(),
  crawled: z.number().optional(),
  alternate: z.array(FeedlyAlternateSchema).optional(),
  origin: FeedlyOriginSchema.optional(),
  originId: z.string().optional(),
  summary: z.object({ content: z.string() }).optional(),
  content: z.object({ content: z.string() }).optional(),
  author: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  categories: z.array(z.object({
    id: z.string(),
    label: z.string().optional(),
  })).optional(),
});

export const FeedlyStreamResponseSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  items: z.array(FeedlyItemSchema),
  continuation: z.string().optional(),
  updated: z.number().optional(),
});

export type FeedlyItem = z.infer<typeof FeedlyItemSchema>;
export type FeedlyStreamResponse = z.infer<typeof FeedlyStreamResponseSchema>;

// Internal types
export interface NewsItem {
  id: string;
  title: string;
  url: string;
  canonicalUrl: string;
  sourceDomain: string;
  sourceTitle: string;
  published: number;
  author?: string;
  summary?: string;
  keywords: string[];
}

export interface NewsGroup {
  groupName: string;
  summaryBullets: string[];
  items: NewsItem[];
  topKeywords: string[];
}

export interface StreamError {
  streamId: string;
  error: string;
}

export interface NewsAPIResponse {
  items: NewsItem[];
  grouped: NewsGroup[];
  metadata: {
    streamsUsed: string[];
    pulledAt: string;
    topN: number;
    dedupeCount: number;
    errorCount: number;
    errors: StreamError[];
    smartGrouping: boolean;
    smartSummary: boolean;
  };
}
