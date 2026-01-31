import { NewsGroup, NewsItem } from '@/types';

/**
 * Generate baseline summaries from titles (no LLM)
 * Creates bullet points from the most representative titles
 */
export function generateBaselineSummaries(groups: NewsGroup[]): NewsGroup[] {
  return groups.map((group) => ({
    ...group,
    summaryBullets: generateBulletsFromTitles(group.items),
  }));
}

/**
 * Generate bullet summaries from titles
 */
function generateBulletsFromTitles(items: NewsItem[]): string[] {
  if (items.length === 0) return [];

  // Take top titles (most recent) and clean them up
  const maxBullets = Math.min(5, items.length);
  const bullets: string[] = [];

  // Sort by published date (most recent first)
  const sorted = [...items].sort((a, b) => b.published - a.published);

  for (let i = 0; i < maxBullets && i < sorted.length; i++) {
    const item = sorted[i];
    let bullet = cleanTitle(item.title);

    // Add source domain for context
    if (item.sourceDomain && bullet.length < 100) {
      bullet = `${bullet} (${item.sourceDomain})`;
    }

    bullets.push(bullet);
  }

  return bullets;
}

/**
 * Clean up title for display
 */
function cleanTitle(title: string): string {
  return title
    .replace(/\s+/g, ' ')
    .replace(/\s*[-–—|]\s*.*$/, '') // Remove source suffix like "- The Verge"
    .trim();
}

/**
 * Generate smart summaries using Anthropic API
 */
export async function generateSmartSummaries(
  groups: NewsGroup[],
  apiKey: string
): Promise<NewsGroup[]> {
  const results = await Promise.all(
    groups.map(async (group) => {
      try {
        const summaryBullets = await generateGroupSummary(group, apiKey);
        return { ...group, summaryBullets };
      } catch (error) {
        console.error(`Failed to generate summary for ${group.groupName}:`, error);
        // Fall back to baseline
        return {
          ...group,
          summaryBullets: generateBulletsFromTitles(group.items),
        };
      }
    })
  );

  return results;
}

/**
 * Generate summary for a single group using Anthropic
 */
async function generateGroupSummary(
  group: NewsGroup,
  apiKey: string
): Promise<string[]> {
  const titles = group.items
    .slice(0, 10) // Limit to 10 items for context
    .map((item) => `- ${item.title} (${item.sourceDomain})`)
    .join('\n');

  const prompt = `You are a news summarizer. Given these news headlines from the "${group.groupName}" category, generate 3-5 concise bullet points that capture the key themes and stories. Each bullet should be a complete thought, 10-20 words. Focus on what's happening, not meta-commentary.

Headlines:
${titles}

Return ONLY the bullet points, one per line, starting with "• ". No other text.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Parse bullet points
    const bullets = text
      .split('\n')
      .map((line: string) => line.replace(/^[•\-*]\s*/, '').trim())
      .filter((line: string) => line.length > 0);

    return bullets.slice(0, 5);
  } catch (error) {
    console.error('Anthropic API error:', error);
    throw error;
  }
}

/**
 * Main summarization function
 */
export async function summarizeGroups(
  groups: NewsGroup[],
  useSmartSummary: boolean,
  anthropicApiKey?: string
): Promise<NewsGroup[]> {
  if (useSmartSummary && anthropicApiKey) {
    return generateSmartSummaries(groups, anthropicApiKey);
  }

  return generateBaselineSummaries(groups);
}
