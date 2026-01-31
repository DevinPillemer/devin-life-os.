/**
 * Configuration from environment variables
 */

export interface Config {
  feedlyToken: string;
  feedlyStreamIds: string[];
  topNDefault: number;
  anthropicApiKey?: string;
  smartSummary: boolean;
  smartGrouping: boolean;
}

export function getConfig(): Config {
  const feedlyToken = process.env.FEEDLY_TOKEN || '';
  const streamIdsRaw = process.env.FEEDLY_STREAM_IDS || '';
  const streamIds = streamIdsRaw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return {
    feedlyToken,
    feedlyStreamIds: streamIds,
    topNDefault: parseInt(process.env.TOP_N_DEFAULT || '20', 10),
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    smartSummary: process.env.SMART_SUMMARY === '1',
    smartGrouping: process.env.SMART_GROUPING === '1',
  };
}

export function validateConfig(config: Config): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.feedlyToken) {
    errors.push('FEEDLY_TOKEN is required');
  }

  if (config.feedlyStreamIds.length === 0) {
    errors.push('FEEDLY_STREAM_IDS is required (comma-separated list)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
