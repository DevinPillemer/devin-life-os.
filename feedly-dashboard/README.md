# Feedly News Dashboard

A clean, minimal dashboard to view and organize news from your Feedly feeds. Supports multiple streams, deduplication, topic grouping, and optional AI-powered summaries.

## Features

- **Multi-stream aggregation**: Pull news from multiple Feedly feeds, categories, or boards
- **Smart deduplication**: Removes duplicate stories based on canonical URLs
- **Recency ranking**: Stories sorted by publication time
- **Topic grouping**: Automatically groups stories into coherent topics
  - Deterministic mode: Uses predefined topic categories (AI, Tech, Business, Science, Politics, Entertainment)
  - Smart mode: Clusters stories by title similarity
- **Summaries**: Each group gets bullet-point summaries
  - Baseline: Extracted from top headlines
  - AI-powered: Uses Claude to generate contextual summaries (optional)
- **Search & filter**: Filter stories by keyword
- **View modes**: Toggle between grouped view and flat "all stories" view
- **Top N toggle**: Switch between Top 20 and Top 40 stories
- **Error handling**: Graceful handling of partial failures with error banners

## Getting Started

### 1. Get your Feedly API Token

1. Go to [Feedly Developer Portal](https://feedly.com/v3/auth/dev)
2. Log in with your Feedly account
3. Generate a developer access token
4. Copy the token - you'll need it for `.env.local`

### 2. Find your Stream IDs

Stream IDs can be:
- **Feed IDs**: `feed/http://feeds.feedburner.com/TechCrunch`
- **Category IDs**: `user/{userId}/category/{categoryName}` (e.g., `user/12345/category/Tech`)
- **Tag IDs**: `user/{userId}/tag/{tagName}`
- **Board IDs**: `user/{userId}/board/{boardName}`

**How to find them:**

**Option A: Browser DevTools**
1. Go to [feedly.com](https://feedly.com) and log in
2. Open browser dev tools (F12)
3. Go to the Network tab
4. Navigate to a feed/folder in Feedly
5. Look for requests to `/v3/streams/contents`
6. The `streamId` query parameter is what you need

**Option B: API**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://cloud.feedly.com/v3/subscriptions" | jq '.[].id'
```

### 3. Set up environment variables

Copy the example file:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:
```env
# Required
FEEDLY_TOKEN=your_token_here
FEEDLY_STREAM_IDS=feed/http://example.com/rss,user/xxx/category/Tech

# Optional
TOP_N_DEFAULT=20
ANTHROPIC_API_KEY=sk-ant-xxxxx  # For AI summaries
SMART_SUMMARY=1                  # Enable AI summaries
SMART_GROUPING=0                 # Use smart clustering
```

### 4. Install and run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Usage

### Dashboard Controls

- **Refresh**: Click the blue "Refresh" button to fetch latest news
- **Top N toggle**: Switch between Top 20 and Top 40 stories
- **View toggle**: Switch between "Grouped" and "All Stories" views
- **Smart Grouping**: Enable/disable smart title-based clustering
- **Search**: Filter stories by keyword (searches titles and sources)

### Grouped View

Stories are organized into topic clusters:
- **AI & Machine Learning**: AI, ML, LLMs, robotics news
- **Technology & Software**: Programming, DevOps, startups
- **Business & Finance**: Markets, investments, crypto
- **Science & Research**: Research, space, climate, health
- **Politics & World**: Government, policy, international
- **Entertainment & Culture**: Movies, gaming, sports
- **Other News**: Uncategorized stories

Each group shows:
- Summary bullets (key themes from the group)
- List of stories with title, source, and time
- Topic keywords

### All Stories View

Flat chronological list of all stories, sorted by recency.

## API Endpoint

The dashboard uses a server-side API route to fetch from Feedly:

```
GET /api/news?topN=20&smartGrouping=0&smartSummary=0
```

**Query Parameters:**
- `topN` (number): Number of top stories to return (default: 20)
- `smartGrouping` (0|1): Enable smart clustering (default: from env)
- `smartSummary` (0|1): Enable AI summaries (default: from env)

**Response:**
```json
{
  "items": [...],
  "grouped": [
    {
      "groupName": "AI & Machine Learning",
      "summaryBullets": ["..."],
      "items": [...],
      "topKeywords": ["ai", "gpt", ...]
    }
  ],
  "metadata": {
    "streamsUsed": ["feed/..."],
    "pulledAt": "2024-01-15T10:30:00Z",
    "topN": 20,
    "dedupeCount": 5,
    "errorCount": 0,
    "errors": [],
    "smartGrouping": false,
    "smartSummary": false
  }
}
```

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Zod** for API validation
- **date-fns** for date formatting
- **Anthropic Claude** for AI summaries (optional)

## Project Structure

```
feedly-dashboard/
├── src/
│   ├── app/
│   │   ├── api/news/route.ts  # API endpoint
│   │   ├── page.tsx           # Dashboard page
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── GroupCard.tsx      # Topic group card
│   │   ├── StoryRow.tsx       # Individual story
│   │   ├── HeaderControls.tsx # Controls bar
│   │   ├── ErrorBanner.tsx    # Error display
│   │   └── LoadingSpinner.tsx # Loading state
│   ├── lib/
│   │   ├── feedly.ts          # Feedly API client
│   │   ├── aggregate.ts       # Dedupe, rank, group
│   │   ├── summarize.ts       # Summary generation
│   │   └── config.ts          # Environment config
│   └── types/
│       └── index.ts           # TypeScript types
├── .env.local.example
├── README.md
└── package.json
```

## Security

- Feedly token is kept server-side only (never exposed to browser)
- API route handles all Feedly communication
- No client-side secrets

## License

MIT
