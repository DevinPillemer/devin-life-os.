import { FeedlyItem } from '@/types';
import { NewsItem, NewsGroup } from '@/types';
import { extractUrl, extractDomain, normalizeUrl } from './feedly';

// Topic keywords for deterministic grouping
const TOPIC_KEYWORDS: Record<string, string[]> = {
  'AI & Machine Learning': [
    'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning',
    'neural network', 'gpt', 'llm', 'chatgpt', 'openai', 'anthropic', 'claude',
    'generative ai', 'transformer', 'nlp', 'computer vision', 'robotics'
  ],
  'Technology & Software': [
    'software', 'programming', 'developer', 'code', 'github', 'api',
    'cloud', 'aws', 'azure', 'kubernetes', 'docker', 'devops', 'saas',
    'startup', 'tech', 'app', 'platform', 'infrastructure'
  ],
  'Business & Finance': [
    'market', 'stock', 'investment', 'ipo', 'funding', 'venture capital',
    'revenue', 'profit', 'earnings', 'acquisition', 'merger', 'ceo',
    'company', 'business', 'economy', 'financial', 'bank', 'crypto', 'bitcoin'
  ],
  'Science & Research': [
    'research', 'study', 'scientist', 'discovery', 'experiment', 'journal',
    'university', 'physics', 'chemistry', 'biology', 'space', 'nasa',
    'climate', 'environment', 'health', 'medicine', 'vaccine'
  ],
  'Politics & World': [
    'government', 'election', 'president', 'congress', 'senate', 'policy',
    'law', 'regulation', 'court', 'supreme court', 'vote', 'democrat',
    'republican', 'war', 'military', 'diplomacy', 'international'
  ],
  'Entertainment & Culture': [
    'movie', 'film', 'tv', 'television', 'streaming', 'netflix', 'disney',
    'music', 'album', 'concert', 'celebrity', 'entertainment', 'game',
    'gaming', 'esports', 'sports', 'nfl', 'nba'
  ],
};

/**
 * Convert Feedly items to NewsItems
 */
export function convertToNewsItems(feedlyItems: FeedlyItem[]): NewsItem[] {
  return feedlyItems
    .filter((item) => item.title) // Must have a title
    .map((item) => {
      const url = extractUrl(item);
      const canonicalUrl = normalizeUrl(url);
      const sourceDomain = extractDomain(url);

      // Extract summary/content
      let summary = '';
      if (item.summary?.content) {
        summary = stripHtml(item.summary.content).slice(0, 300);
      } else if (item.content?.content) {
        summary = stripHtml(item.content.content).slice(0, 300);
      }

      return {
        id: item.id,
        title: item.title || 'Untitled',
        url,
        canonicalUrl,
        sourceDomain,
        sourceTitle: item.origin?.title || sourceDomain,
        published: item.published || item.crawled || Date.now(),
        author: item.author,
        summary,
        keywords: item.keywords || [],
      };
    })
    .filter((item) => item.url); // Must have a valid URL
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deduplicate items by canonical URL
 */
export function deduplicateItems(items: NewsItem[]): { items: NewsItem[]; dedupeCount: number } {
  const seen = new Map<string, NewsItem>();

  for (const item of items) {
    const existing = seen.get(item.canonicalUrl);
    if (!existing || item.published > existing.published) {
      seen.set(item.canonicalUrl, item);
    }
  }

  return {
    items: Array.from(seen.values()),
    dedupeCount: items.length - seen.size,
  };
}

/**
 * Rank items by recency
 */
export function rankByRecency(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => b.published - a.published);
}

/**
 * Get top N items
 */
export function getTopN(items: NewsItem[], n: number): NewsItem[] {
  return items.slice(0, n);
}

/**
 * Deterministic grouping based on topic keywords
 */
export function groupByTopics(items: NewsItem[]): NewsGroup[] {
  const groups: Map<string, NewsItem[]> = new Map();
  const ungrouped: NewsItem[] = [];

  // Initialize groups
  for (const topic of Object.keys(TOPIC_KEYWORDS)) {
    groups.set(topic, []);
  }

  // Assign items to groups
  for (const item of items) {
    const titleLower = item.title.toLowerCase();
    const summaryLower = (item.summary || '').toLowerCase();
    const keywordsLower = item.keywords.map((k) => k.toLowerCase());
    const combined = `${titleLower} ${summaryLower} ${keywordsLower.join(' ')}`;

    let assigned = false;
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      for (const keyword of keywords) {
        if (combined.includes(keyword)) {
          groups.get(topic)!.push(item);
          assigned = true;
          break;
        }
      }
      if (assigned) break;
    }

    if (!assigned) {
      ungrouped.push(item);
    }
  }

  // Convert to NewsGroup array, filter empty groups
  const result: NewsGroup[] = [];

  for (const [groupName, groupItems] of groups) {
    if (groupItems.length > 0) {
      result.push({
        groupName,
        summaryBullets: [], // Will be filled by summarize
        items: groupItems,
        topKeywords: extractTopKeywords(groupItems),
      });
    }
  }

  // Add "Other" group if there are ungrouped items
  if (ungrouped.length > 0) {
    result.push({
      groupName: 'Other News',
      summaryBullets: [],
      items: ungrouped,
      topKeywords: extractTopKeywords(ungrouped),
    });
  }

  // Sort groups by number of items (descending)
  return result.sort((a, b) => b.items.length - a.items.length);
}

/**
 * Smart grouping using lightweight clustering over titles
 * Groups items by similarity of words in titles
 */
export function smartGroupByTitles(items: NewsItem[]): NewsGroup[] {
  if (items.length === 0) return [];

  // Tokenize titles
  const tokenizedItems = items.map((item) => ({
    item,
    tokens: tokenize(item.title),
  }));

  // Build clusters based on word overlap
  const clusters: { items: NewsItem[]; keywords: Set<string> }[] = [];
  const assigned = new Set<string>();

  for (const { item, tokens } of tokenizedItems) {
    if (assigned.has(item.id)) continue;

    // Find the best matching cluster
    let bestCluster: { items: NewsItem[]; keywords: Set<string> } | null = null;
    let bestScore = 0;

    for (const cluster of clusters) {
      const overlap = countOverlap(tokens, cluster.keywords);
      const score = overlap / Math.max(tokens.size, 1);
      if (score > 0.3 && score > bestScore) {
        bestScore = score;
        bestCluster = cluster;
      }
    }

    if (bestCluster) {
      bestCluster.items.push(item);
      tokens.forEach((t) => bestCluster!.keywords.add(t));
      assigned.add(item.id);
    } else {
      // Create new cluster
      const newCluster = { items: [item], keywords: new Set(tokens) };
      clusters.push(newCluster);
      assigned.add(item.id);
    }
  }

  // Merge small clusters into "Other"
  const minClusterSize = 2;
  const validClusters = clusters.filter((c) => c.items.length >= minClusterSize);
  const smallClusters = clusters.filter((c) => c.items.length < minClusterSize);
  const otherItems = smallClusters.flatMap((c) => c.items);

  // Generate group names from top keywords
  const result: NewsGroup[] = validClusters.map((cluster) => {
    const topWords = getMostFrequentWords(cluster.items.map((i) => i.title), 3);
    const groupName = topWords.length > 0
      ? topWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' & ')
      : 'Related Stories';

    return {
      groupName,
      summaryBullets: [],
      items: cluster.items,
      topKeywords: Array.from(cluster.keywords).slice(0, 10),
    };
  });

  if (otherItems.length > 0) {
    result.push({
      groupName: 'Other News',
      summaryBullets: [],
      items: otherItems,
      topKeywords: extractTopKeywords(otherItems),
    });
  }

  return result.sort((a, b) => b.items.length - a.items.length);
}

/**
 * Tokenize a title into significant words
 */
function tokenize(text: string): Set<string> {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'our',
    'you', 'your', 'he', 'she', 'his', 'her', 'who', 'what', 'when',
    'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same',
    'than', 'too', 'very', 'just', 'about', 'into', 'over', 'after',
    'new', 'says', 'said', 'get', 'gets', 'got', 'make', 'makes', 'made',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  return new Set(words);
}

/**
 * Count overlap between two sets
 */
function countOverlap(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const word of a) {
    if (b.has(word)) count++;
  }
  return count;
}

/**
 * Get most frequent words from titles
 */
function getMostFrequentWords(titles: string[], n: number): string[] {
  const wordCounts = new Map<string, number>();

  for (const title of titles) {
    const tokens = tokenize(title);
    for (const token of tokens) {
      wordCounts.set(token, (wordCounts.get(token) || 0) + 1);
    }
  }

  return Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([word]) => word);
}

/**
 * Extract top keywords from items
 */
function extractTopKeywords(items: NewsItem[]): string[] {
  const keywordCounts = new Map<string, number>();

  for (const item of items) {
    // From explicit keywords
    for (const keyword of item.keywords) {
      const kw = keyword.toLowerCase();
      keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1);
    }
    // From title
    const tokens = tokenize(item.title);
    for (const token of tokens) {
      keywordCounts.set(token, (keywordCounts.get(token) || 0) + 1);
    }
  }

  return Array.from(keywordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Full aggregation pipeline
 */
export function aggregateNews(
  feedlyItems: FeedlyItem[],
  topN: number,
  smartGrouping: boolean = false
): {
  items: NewsItem[];
  grouped: NewsGroup[];
  dedupeCount: number;
} {
  // Convert to NewsItems
  const newsItems = convertToNewsItems(feedlyItems);

  // Deduplicate
  const { items: dedupedItems, dedupeCount } = deduplicateItems(newsItems);

  // Rank by recency
  const rankedItems = rankByRecency(dedupedItems);

  // Get top N
  const topItems = getTopN(rankedItems, topN);

  // Group
  const grouped = smartGrouping
    ? smartGroupByTitles(topItems)
    : groupByTopics(topItems);

  return {
    items: topItems,
    grouped,
    dedupeCount,
  };
}
