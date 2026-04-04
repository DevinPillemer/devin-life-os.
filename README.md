# Floopify v2 — Life OS Dashboard

A beautiful daily-tracking dashboard for health, habits, finance, goals, and learning. Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- **Daily Command Center** — KPI cards, calendar, habits checklist, activity feed
- **Daily Habits** — Category-based tracker with GitHub-style heatmap, streaks, and points
- **Health** — Strava integration for runs, swims, rides with effort trends
- **Goals** — Notion-powered goals with filtering, sorting, and progress tracking
- **Finance** — Google Sheets portfolio with holdings table, allocation chart, net worth trend
- **Wallet** — Gamification system with earnings by module, progress ring, and ledger
- **Learning** — Course/book tracker with streaks and completion status
- **Settings** — API configuration and profile management

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Recharts
- Vercel deployment

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN`
- `NOTION_API_KEY`, `NOTION_GOALS_DB_ID`
- `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`
- `GOOGLE_CALENDAR_ID`
- `NEXT_PUBLIC_APP_URL`

## Deployment

Auto-deploys to Vercel on push. Set environment variables in the Vercel dashboard.
