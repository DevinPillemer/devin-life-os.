import { NewsItem, NewsGroup, NewsAPIResponse } from '@/types';

/**
 * Generate realistic mock news data for demo mode
 */

const now = Date.now();
const hour = 60 * 60 * 1000;
const day = 24 * hour;

// Mock news items with realistic content
const mockItems: NewsItem[] = [
  // AI & Machine Learning
  {
    id: 'mock-1',
    title: 'OpenAI Announces GPT-5 with Breakthrough Reasoning Capabilities',
    url: 'https://techcrunch.com/2024/01/15/openai-gpt5-announcement',
    canonicalUrl: 'techcrunch.com/2024/01/15/openai-gpt5-announcement',
    sourceDomain: 'techcrunch.com',
    sourceTitle: 'TechCrunch',
    published: now - 2 * hour,
    author: 'Kyle Wiggers',
    summary: 'OpenAI has unveiled GPT-5, featuring significantly improved reasoning and reduced hallucinations.',
    keywords: ['ai', 'openai', 'gpt-5', 'llm'],
  },
  {
    id: 'mock-2',
    title: 'Google DeepMind Achieves New Milestone in Protein Structure Prediction',
    url: 'https://nature.com/articles/deepmind-protein-2024',
    canonicalUrl: 'nature.com/articles/deepmind-protein-2024',
    sourceDomain: 'nature.com',
    sourceTitle: 'Nature',
    published: now - 4 * hour,
    author: 'Elizabeth Gibney',
    summary: 'AlphaFold 3 can now predict protein interactions with unprecedented accuracy.',
    keywords: ['ai', 'deepmind', 'alphafold', 'biology'],
  },
  {
    id: 'mock-3',
    title: 'Anthropic Raises $2B in New Funding Round Led by Google',
    url: 'https://reuters.com/technology/anthropic-funding-2024',
    canonicalUrl: 'reuters.com/technology/anthropic-funding-2024',
    sourceDomain: 'reuters.com',
    sourceTitle: 'Reuters',
    published: now - 6 * hour,
    author: 'Jane Doe',
    summary: 'The AI safety startup reaches $15B valuation as competition in the AI space intensifies.',
    keywords: ['ai', 'anthropic', 'funding', 'startup'],
  },
  {
    id: 'mock-4',
    title: 'Meta Releases Llama 3 as Open Source, Challenges GPT-4',
    url: 'https://theverge.com/meta-llama-3-open-source',
    canonicalUrl: 'theverge.com/meta-llama-3-open-source',
    sourceDomain: 'theverge.com',
    sourceTitle: 'The Verge',
    published: now - 8 * hour,
    author: 'James Vincent',
    summary: 'Meta continues its open-source AI strategy with a model that rivals proprietary alternatives.',
    keywords: ['ai', 'meta', 'llama', 'open-source'],
  },

  // Technology & Software
  {
    id: 'mock-5',
    title: 'React 19 Released with Revolutionary Compiler and Server Components',
    url: 'https://react.dev/blog/react-19',
    canonicalUrl: 'react.dev/blog/react-19',
    sourceDomain: 'react.dev',
    sourceTitle: 'React Blog',
    published: now - 3 * hour,
    author: 'React Team',
    summary: 'The new React compiler automatically optimizes re-renders without memo or useMemo.',
    keywords: ['react', 'javascript', 'frontend', 'programming'],
  },
  {
    id: 'mock-6',
    title: 'GitHub Copilot Workspace: AI-Powered Development Environment Launches',
    url: 'https://github.blog/copilot-workspace-launch',
    canonicalUrl: 'github.blog/copilot-workspace-launch',
    sourceDomain: 'github.blog',
    sourceTitle: 'GitHub Blog',
    published: now - 5 * hour,
    author: 'Thomas Dohmke',
    summary: 'Developers can now plan, build, and test entire features using natural language.',
    keywords: ['github', 'copilot', 'ai', 'developer-tools'],
  },
  {
    id: 'mock-7',
    title: 'Rust Foundation Announces Major Security Initiative for Critical Infrastructure',
    url: 'https://foundation.rust-lang.org/security-initiative',
    canonicalUrl: 'foundation.rust-lang.org/security-initiative',
    sourceDomain: 'foundation.rust-lang.org',
    sourceTitle: 'Rust Foundation',
    published: now - 10 * hour,
    author: 'Rebecca Rumbul',
    summary: 'New funding will support security audits and memory-safe alternatives to C code.',
    keywords: ['rust', 'security', 'programming', 'infrastructure'],
  },

  // Business & Finance
  {
    id: 'mock-8',
    title: 'Apple Vision Pro Sales Exceed Expectations in First Quarter',
    url: 'https://bloomberg.com/apple-vision-pro-sales',
    canonicalUrl: 'bloomberg.com/apple-vision-pro-sales',
    sourceDomain: 'bloomberg.com',
    sourceTitle: 'Bloomberg',
    published: now - 1 * hour,
    author: 'Mark Gurman',
    summary: 'Apple shipped 600,000 units, beating analyst estimates of 400,000.',
    keywords: ['apple', 'vision-pro', 'sales', 'hardware'],
  },
  {
    id: 'mock-9',
    title: 'NVIDIA Becomes World\'s Most Valuable Company, Surpasses Microsoft',
    url: 'https://ft.com/nvidia-market-cap',
    canonicalUrl: 'ft.com/nvidia-market-cap',
    sourceDomain: 'ft.com',
    sourceTitle: 'Financial Times',
    published: now - 7 * hour,
    author: 'Richard Waters',
    summary: 'AI chip demand drives NVIDIA to $3.2 trillion market capitalization.',
    keywords: ['nvidia', 'stocks', 'ai', 'market'],
  },
  {
    id: 'mock-10',
    title: 'Stripe Launches AI-Powered Fraud Detection for Global Payments',
    url: 'https://stripe.com/blog/ai-fraud-detection',
    canonicalUrl: 'stripe.com/blog/ai-fraud-detection',
    sourceDomain: 'stripe.com',
    sourceTitle: 'Stripe Blog',
    published: now - 12 * hour,
    author: 'Patrick Collison',
    summary: 'New system reduces false positives by 40% while catching more fraudulent transactions.',
    keywords: ['stripe', 'fintech', 'ai', 'payments'],
  },

  // Science & Research
  {
    id: 'mock-11',
    title: 'NASA\'s James Webb Telescope Discovers New Earth-Like Exoplanet',
    url: 'https://nasa.gov/webb-exoplanet-discovery',
    canonicalUrl: 'nasa.gov/webb-exoplanet-discovery',
    sourceDomain: 'nasa.gov',
    sourceTitle: 'NASA',
    published: now - 9 * hour,
    author: 'NASA Science',
    summary: 'The rocky planet lies in the habitable zone and shows signs of an atmosphere.',
    keywords: ['nasa', 'space', 'exoplanet', 'jwst'],
  },
  {
    id: 'mock-12',
    title: 'Breakthrough in Quantum Computing: 1000 Qubit Processor Achieved',
    url: 'https://ibm.com/quantum-1000-qubit',
    canonicalUrl: 'ibm.com/quantum-1000-qubit',
    sourceDomain: 'ibm.com',
    sourceTitle: 'IBM Research',
    published: now - 14 * hour,
    author: 'IBM Quantum Team',
    summary: 'IBM\'s new processor brings practical quantum computing closer to reality.',
    keywords: ['quantum', 'ibm', 'computing', 'research'],
  },
  {
    id: 'mock-13',
    title: 'CRISPR Gene Therapy Approved for Sickle Cell Disease Treatment',
    url: 'https://nejm.org/crispr-sickle-cell',
    canonicalUrl: 'nejm.org/crispr-sickle-cell',
    sourceDomain: 'nejm.org',
    sourceTitle: 'NEJM',
    published: now - 1 * day,
    author: 'Medical Staff',
    summary: 'FDA approval marks first gene-editing therapy for inherited blood disorder.',
    keywords: ['crispr', 'medicine', 'genetics', 'fda'],
  },

  // Entertainment & Culture
  {
    id: 'mock-14',
    title: 'GTA 6 Trailer Breaks YouTube Record with 100 Million Views in 24 Hours',
    url: 'https://ign.com/gta6-trailer-record',
    canonicalUrl: 'ign.com/gta6-trailer-record',
    sourceDomain: 'ign.com',
    sourceTitle: 'IGN',
    published: now - 11 * hour,
    author: 'Ryan McCaffrey',
    summary: 'Rockstar\'s trailer becomes the most-viewed video game trailer in history.',
    keywords: ['gaming', 'gta6', 'rockstar', 'youtube'],
  },
  {
    id: 'mock-15',
    title: 'Netflix Announces Live Sports Streaming with NFL Partnership',
    url: 'https://variety.com/netflix-nfl-deal',
    canonicalUrl: 'variety.com/netflix-nfl-deal',
    sourceDomain: 'variety.com',
    sourceTitle: 'Variety',
    published: now - 15 * hour,
    author: 'Todd Spangler',
    summary: 'The streaming giant will broadcast Christmas Day games starting this season.',
    keywords: ['netflix', 'nfl', 'streaming', 'sports'],
  },

  // Politics & World
  {
    id: 'mock-16',
    title: 'EU Passes Landmark AI Regulation Act with Strict Compliance Rules',
    url: 'https://euronews.com/eu-ai-act-passed',
    canonicalUrl: 'euronews.com/eu-ai-act-passed',
    sourceDomain: 'euronews.com',
    sourceTitle: 'Euronews',
    published: now - 13 * hour,
    author: 'Brussels Bureau',
    summary: 'Companies face heavy fines for non-compliance with new artificial intelligence rules.',
    keywords: ['eu', 'regulation', 'ai', 'policy'],
  },
  {
    id: 'mock-17',
    title: 'US and China Agree to Resume Climate Cooperation Talks',
    url: 'https://nytimes.com/us-china-climate-talks',
    canonicalUrl: 'nytimes.com/us-china-climate-talks',
    sourceDomain: 'nytimes.com',
    sourceTitle: 'New York Times',
    published: now - 18 * hour,
    author: 'Lisa Friedman',
    summary: 'The two largest emitters will work together on methane reduction and renewable energy.',
    keywords: ['climate', 'diplomacy', 'us', 'china'],
  },

  // More AI stories
  {
    id: 'mock-18',
    title: 'Microsoft Integrates GPT-4 Turbo Across All Office 365 Applications',
    url: 'https://microsoft.com/office-gpt4-turbo',
    canonicalUrl: 'microsoft.com/office-gpt4-turbo',
    sourceDomain: 'microsoft.com',
    sourceTitle: 'Microsoft Blog',
    published: now - 16 * hour,
    author: 'Satya Nadella',
    summary: 'Copilot features now available in Word, Excel, PowerPoint with faster responses.',
    keywords: ['microsoft', 'ai', 'office', 'copilot'],
  },
  {
    id: 'mock-19',
    title: 'Stanford Researchers Develop AI That Explains Its Own Reasoning',
    url: 'https://stanford.edu/ai-explainability',
    canonicalUrl: 'stanford.edu/ai-explainability',
    sourceDomain: 'stanford.edu',
    sourceTitle: 'Stanford News',
    published: now - 20 * hour,
    author: 'Stanford AI Lab',
    summary: 'New approach makes large language model decisions more transparent and trustworthy.',
    keywords: ['ai', 'research', 'explainability', 'stanford'],
  },
  {
    id: 'mock-20',
    title: 'AWS Launches Bedrock Enterprise with Custom Model Training',
    url: 'https://aws.amazon.com/bedrock-enterprise',
    canonicalUrl: 'aws.amazon.com/bedrock-enterprise',
    sourceDomain: 'aws.amazon.com',
    sourceTitle: 'AWS News',
    published: now - 22 * hour,
    author: 'AWS Team',
    summary: 'Companies can now fine-tune foundation models on their proprietary data.',
    keywords: ['aws', 'ai', 'cloud', 'enterprise'],
  },
];

// Pre-grouped mock data
const mockGroups: NewsGroup[] = [
  {
    groupName: 'AI & Machine Learning',
    summaryBullets: [
      'OpenAI announces GPT-5 with improved reasoning capabilities',
      'Anthropic raises $2B at $15B valuation as AI competition heats up',
      'Meta releases Llama 3 as open source, challenging proprietary models',
      'Microsoft integrates GPT-4 Turbo across Office 365 suite',
    ],
    items: mockItems.filter(item =>
      ['mock-1', 'mock-2', 'mock-3', 'mock-4', 'mock-18', 'mock-19', 'mock-20'].includes(item.id)
    ),
    topKeywords: ['ai', 'openai', 'gpt', 'llm', 'anthropic', 'deepmind'],
  },
  {
    groupName: 'Technology & Software',
    summaryBullets: [
      'React 19 introduces revolutionary compiler for automatic optimization',
      'GitHub Copilot Workspace enables AI-powered feature development',
      'Rust Foundation launches major security initiative for critical infrastructure',
    ],
    items: mockItems.filter(item =>
      ['mock-5', 'mock-6', 'mock-7'].includes(item.id)
    ),
    topKeywords: ['react', 'github', 'rust', 'programming', 'developer'],
  },
  {
    groupName: 'Business & Finance',
    summaryBullets: [
      'Apple Vision Pro exceeds sales expectations with 600K units shipped',
      'NVIDIA becomes world\'s most valuable company at $3.2T market cap',
      'Stripe launches AI-powered fraud detection reducing false positives by 40%',
    ],
    items: mockItems.filter(item =>
      ['mock-8', 'mock-9', 'mock-10'].includes(item.id)
    ),
    topKeywords: ['nvidia', 'apple', 'stripe', 'market', 'fintech'],
  },
  {
    groupName: 'Science & Research',
    summaryBullets: [
      'James Webb Telescope discovers potential Earth-like exoplanet',
      'IBM achieves 1000-qubit quantum processor milestone',
      'FDA approves first CRISPR gene therapy for sickle cell disease',
    ],
    items: mockItems.filter(item =>
      ['mock-11', 'mock-12', 'mock-13'].includes(item.id)
    ),
    topKeywords: ['nasa', 'quantum', 'crispr', 'research', 'space'],
  },
  {
    groupName: 'Politics & World',
    summaryBullets: [
      'EU passes landmark AI Act with strict compliance requirements',
      'US and China agree to resume climate cooperation talks',
    ],
    items: mockItems.filter(item =>
      ['mock-16', 'mock-17'].includes(item.id)
    ),
    topKeywords: ['eu', 'regulation', 'climate', 'policy', 'diplomacy'],
  },
  {
    groupName: 'Entertainment & Culture',
    summaryBullets: [
      'GTA 6 trailer breaks YouTube record with 100M views in 24 hours',
      'Netflix partners with NFL for live Christmas Day game streaming',
    ],
    items: mockItems.filter(item =>
      ['mock-14', 'mock-15'].includes(item.id)
    ),
    topKeywords: ['gaming', 'netflix', 'sports', 'streaming'],
  },
];

/**
 * Get mock API response for demo mode
 */
export function getMockNewsResponse(topN: number = 20): NewsAPIResponse {
  const items = mockItems.slice(0, topN);

  // Filter groups to only include items within topN
  const itemIds = new Set(items.map(i => i.id));
  const filteredGroups = mockGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => itemIds.has(item.id)),
    }))
    .filter(group => group.items.length > 0);

  return {
    items,
    grouped: filteredGroups,
    metadata: {
      streamsUsed: ['demo/mock-feed-1', 'demo/mock-feed-2'],
      pulledAt: new Date().toISOString(),
      topN,
      dedupeCount: 3,
      errorCount: 0,
      errors: [],
      smartGrouping: false,
      smartSummary: false,
    },
  };
}

/**
 * Check if demo mode should be used
 */
export function isDemoMode(): boolean {
  const token = process.env.FEEDLY_TOKEN;
  const streamIds = process.env.FEEDLY_STREAM_IDS;
  return !token || !streamIds;
}
