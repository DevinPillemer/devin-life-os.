// ── Habits ──
export interface Habit {
  id: string;
  name: string;
  category: "Health" | "Spiritual" | "Focus" | "Learning" | "Lifestyle";
  points: number;
  completed: boolean;
  streak: number;
}

export const mockHabits: Habit[] = [
  { id: "h1", name: "Morning Run / Swim", category: "Health", points: 15, completed: true, streak: 12 },
  { id: "h2", name: "Cold Shower", category: "Health", points: 5, completed: true, streak: 8 },
  { id: "h3", name: "Meditate 10 min", category: "Spiritual", points: 10, completed: false, streak: 3 },
  { id: "h4", name: "Gratitude Journal", category: "Spiritual", points: 5, completed: true, streak: 15 },
  { id: "h5", name: "Deep Work Block (2h)", category: "Focus", points: 20, completed: false, streak: 5 },
  { id: "h6", name: "No Phone First Hour", category: "Focus", points: 10, completed: true, streak: 22 },
  { id: "h7", name: "Read 30 min", category: "Learning", points: 10, completed: false, streak: 7 },
  { id: "h8", name: "Language Practice", category: "Learning", points: 10, completed: true, streak: 4 },
  { id: "h9", name: "Healthy Meal Prep", category: "Lifestyle", points: 10, completed: true, streak: 6 },
  { id: "h10", name: "Screen Off by 22:00", category: "Lifestyle", points: 5, completed: false, streak: 2 },
];

// ── Strava Activities ──
export interface StravaActivity {
  id: number;
  name: string;
  type: "Run" | "Swim" | "Ride" | "Walk" | "Hike";
  distance: number; // meters
  moving_time: number; // seconds
  start_date: string;
  suffer_score: number;
}

export const mockActivities: StravaActivity[] = [
  { id: 1, name: "Morning Beach Run", type: "Run", distance: 8200, moving_time: 2460, start_date: "2026-04-04T06:30:00Z", suffer_score: 72 },
  { id: 2, name: "Pool Session", type: "Swim", distance: 2000, moving_time: 2400, start_date: "2026-04-03T07:00:00Z", suffer_score: 55 },
  { id: 3, name: "Carmel Ride", type: "Ride", distance: 32000, moving_time: 5400, start_date: "2026-04-02T16:00:00Z", suffer_score: 110 },
  { id: 4, name: "Recovery Jog", type: "Run", distance: 5000, moving_time: 1800, start_date: "2026-04-01T06:00:00Z", suffer_score: 35 },
  { id: 5, name: "Open Water Swim", type: "Swim", distance: 1500, moving_time: 1800, start_date: "2026-03-31T07:00:00Z", suffer_score: 65 },
  { id: 6, name: "Interval Training", type: "Run", distance: 6000, moving_time: 2100, start_date: "2026-03-30T06:30:00Z", suffer_score: 95 },
  { id: 7, name: "Weekend Long Run", type: "Run", distance: 15000, moving_time: 5100, start_date: "2026-03-29T07:00:00Z", suffer_score: 130 },
];

// ── Goals ──
export interface Goal {
  id: string;
  name: string;
  category: "Finance" | "Learning" | "Family Life" | "Career" | "Health";
  status: "In Progress" | "Completed" | "Not Started";
  progress: number;
  creditValue: number;
}

export const mockGoals: Goal[] = [
  { id: "g1", name: "Emergency Fund ₪50K", category: "Finance", status: "In Progress", progress: 72, creditValue: 100 },
  { id: "g2", name: "TypeScript Certification", category: "Learning", status: "In Progress", progress: 85, creditValue: 50 },
  { id: "g3", name: "Run Half Marathon", category: "Health", status: "In Progress", progress: 60, creditValue: 75 },
  { id: "g4", name: "Family Trip to Greece", category: "Family Life", status: "Not Started", progress: 15, creditValue: 40 },
  { id: "g5", name: "Promote 3 SDRs to AE", category: "Career", status: "In Progress", progress: 33, creditValue: 80 },
  { id: "g6", name: "Read 24 Books", category: "Learning", status: "In Progress", progress: 42, creditValue: 30 },
  { id: "g7", name: "Portfolio to ₪200K", category: "Finance", status: "In Progress", progress: 55, creditValue: 90 },
  { id: "g8", name: "Complete Hebrew B2", category: "Learning", status: "Completed", progress: 100, creditValue: 60 },
];

// ── Finance ──
export interface Holding {
  ticker: string;
  name: string;
  shares: number;
  price: number;
  value: number;
  dayChange: number;
  category: "Stocks" | "Crypto" | "Cash" | "Real Estate";
}

export const mockHoldings: Holding[] = [
  { ticker: "VOO", name: "Vanguard S&P 500", shares: 12, price: 485.30, value: 5823.60, dayChange: 1.2, category: "Stocks" },
  { ticker: "QQQ", name: "Invesco QQQ Trust", shares: 8, price: 445.10, value: 3560.80, dayChange: -0.4, category: "Stocks" },
  { ticker: "MSFT", name: "Microsoft", shares: 15, price: 425.80, value: 6387.00, dayChange: 0.8, category: "Stocks" },
  { ticker: "BTC", name: "Bitcoin", shares: 0.15, price: 68500, value: 10275.00, dayChange: 2.5, category: "Crypto" },
  { ticker: "ETH", name: "Ethereum", shares: 3.2, price: 3450, value: 11040.00, dayChange: -1.1, category: "Crypto" },
  { ticker: "SOL", name: "Solana", shares: 45, price: 142.50, value: 6412.50, dayChange: 3.2, category: "Crypto" },
  { ticker: "CASH", name: "Bank Savings", shares: 1, price: 28000, value: 28000, dayChange: 0, category: "Cash" },
  { ticker: "APT", name: "Haifa Apartment", shares: 1, price: 95000, value: 95000, dayChange: 0, category: "Real Estate" },
];

export const mockNetWorthHistory = [
  { month: "Oct", value: 148000 },
  { month: "Nov", value: 151000 },
  { month: "Dec", value: 155000 },
  { month: "Jan", value: 152000 },
  { month: "Feb", value: 158000 },
  { month: "Mar", value: 162000 },
  { month: "Apr", value: 166499 },
];

// ── Wallet ──
export interface WalletEntry {
  module: string;
  earned: number;
  color: string;
}

export const mockWallet: WalletEntry[] = [
  { module: "Health", earned: 180, color: "#14b8a6" },
  { module: "Habits", earned: 245, color: "#8b5cf6" },
  { module: "Finance", earned: 120, color: "#f59e0b" },
  { module: "Learning", earned: 95, color: "#3b82f6" },
  { module: "Goals", earned: 160, color: "#ec4899" },
];

export const mockWalletLedger = [
  { date: "2026-04-04", description: "Morning Run streak bonus", amount: 15, module: "Health" },
  { date: "2026-04-04", description: "5 habits completed", amount: 25, module: "Habits" },
  { date: "2026-04-03", description: "Goal progress: Emergency Fund", amount: 10, module: "Goals" },
  { date: "2026-04-03", description: "Reading streak: 7 days", amount: 20, module: "Learning" },
  { date: "2026-04-02", description: "Portfolio milestone: +5%", amount: 30, module: "Finance" },
  { date: "2026-04-02", description: "All habits completed!", amount: 50, module: "Habits" },
  { date: "2026-04-01", description: "Swim session logged", amount: 10, module: "Health" },
  { date: "2026-04-01", description: "Course module finished", amount: 15, module: "Learning" },
  { date: "2026-03-31", description: "Goal completed: Hebrew B2", amount: 60, module: "Goals" },
  { date: "2026-03-31", description: "Interval training PR", amount: 20, module: "Health" },
];

// ── Calendar ──
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
}

export const mockCalendarEvents: CalendarEvent[] = [
  { id: "e1", title: "SDR Team Standup", start: "09:00", end: "09:30", color: "#14b8a6" },
  { id: "e2", title: "Pipeline Review with VP Sales", start: "10:00", end: "11:00", color: "#f59e0b" },
  { id: "e3", title: "1:1 with Noa (SDR)", start: "11:30", end: "12:00", color: "#8b5cf6" },
  { id: "e4", title: "Lunch Break", start: "12:30", end: "13:30", color: "#64748b" },
  { id: "e5", title: "Outbound Strategy Workshop", start: "14:00", end: "15:30", color: "#3b82f6" },
];

// ── Learning ──
export interface LearningModule {
  id: string;
  title: string;
  type: "Course" | "Book" | "Article";
  progress: number;
  completed: boolean;
  points: number;
}

export const mockLearningModules: LearningModule[] = [
  { id: "l1", title: "Advanced TypeScript Patterns", type: "Course", progress: 85, completed: false, points: 50 },
  { id: "l2", title: "System Design Interview", type: "Book", progress: 42, completed: false, points: 30 },
  { id: "l3", title: "The Hard Thing About Hard Things", type: "Book", progress: 100, completed: true, points: 20 },
  { id: "l4", title: "AWS Solutions Architect", type: "Course", progress: 30, completed: false, points: 60 },
  { id: "l5", title: "React Server Components Deep Dive", type: "Article", progress: 100, completed: true, points: 10 },
  { id: "l6", title: "Atomic Habits", type: "Book", progress: 100, completed: true, points: 20 },
  { id: "l7", title: "Next.js 14 Masterclass", type: "Course", progress: 65, completed: false, points: 40 },
];

// ── Activity Feed ──
export interface ActivityItem {
  id: string;
  action: string;
  module: string;
  timestamp: string;
  icon: string;
}

export const mockActivityFeed: ActivityItem[] = [
  { id: "a1", action: "Completed Morning Run (8.2km)", module: "Health", timestamp: "2 hours ago", icon: "🏃" },
  { id: "a2", action: "Checked off 'Cold Shower'", module: "Habits", timestamp: "3 hours ago", icon: "✅" },
  { id: "a3", action: "Portfolio up 1.2% today", module: "Finance", timestamp: "4 hours ago", icon: "📈" },
  { id: "a4", action: "Completed Hebrew B2 goal!", module: "Goals", timestamp: "Yesterday", icon: "🎯" },
  { id: "a5", action: "Read 30 min — streak: 7 days", module: "Learning", timestamp: "Yesterday", icon: "📚" },
  { id: "a6", action: "Earned ₪50 — all habits done", module: "Wallet", timestamp: "Yesterday", icon: "💰" },
  { id: "a7", action: "Pool session: 2km in 40min", module: "Health", timestamp: "2 days ago", icon: "🏊" },
  { id: "a8", action: "Emergency Fund at 72%", module: "Goals", timestamp: "2 days ago", icon: "🎯" },
  { id: "a9", action: "Carmel Ride: 32km", module: "Health", timestamp: "2 days ago", icon: "🚴" },
  { id: "a10", action: "TypeScript course: Module 12", module: "Learning", timestamp: "3 days ago", icon: "💻" },
];

// ── Heatmap data (90 days) ──
export function generateHeatmapData(): { date: string; value: number }[] {
  const data = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    // Weekends lower completion, random variation
    const base = dayOfWeek === 0 || dayOfWeek === 6 ? 0.5 : 0.7;
    const value = Math.min(10, Math.max(0, Math.round((base + Math.random() * 0.4) * 10)));
    data.push({ date: dateStr, value });
  }
  return data;
}

// ── Weekly sparkline data ──
export const mockWeeklyTrends = {
  health: [3, 4, 2, 5, 4, 3, 5],
  habits: [65, 70, 80, 75, 90, 85, 78],
  finance: [158000, 159000, 161000, 160000, 163000, 165000, 166499],
  goals: [28, 30, 32, 33, 35, 36, 38],
  learning: [2, 3, 2, 4, 3, 3, 5],
};
