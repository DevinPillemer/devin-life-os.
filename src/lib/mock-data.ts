// ── Mock Data for all API routes ──

export const walletData = {
  totalEarned: 847,
  maxBudget: 1200,
  weeklyEarnings: [120, 95, 140, 110, 132, 150, 100],
  recentTransactions: [
    { id: 1, label: "Morning routine streak", amount: 15, date: "2026-04-04" },
    { id: 2, label: "Gym session", amount: 10, date: "2026-04-04" },
    { id: 3, label: "Reading 30min", amount: 5, date: "2026-04-03" },
    { id: 4, label: "Weekly review", amount: 20, date: "2026-04-03" },
    { id: 5, label: "Meditation", amount: 5, date: "2026-04-02" },
  ],
};

export const habitsData = {
  date: "2026-04-04",
  completed: 5,
  total: 8,
  habits: [
    { id: 1, name: "Morning meditation", points: 5, done: true, icon: "brain" },
    { id: 2, name: "Exercise", points: 10, done: true, icon: "dumbbell" },
    { id: 3, name: "Read 30 min", points: 5, done: true, icon: "book-open" },
    { id: 4, name: "Journal", points: 5, done: true, icon: "pen-tool" },
    { id: 5, name: "No sugar", points: 10, done: true, icon: "apple" },
    { id: 6, name: "Cold shower", points: 5, done: false, icon: "droplets" },
    { id: 7, name: "Walk 10k steps", points: 10, done: false, icon: "footprints" },
    { id: 8, name: "Sleep by 11pm", points: 5, done: false, icon: "moon" },
  ],
};

export const stravaData = {
  weekSessions: 4,
  weekDistance: 23.5,
  weekDuration: 185,
  weekCalories: 1840,
  activities: [
    { id: 1, type: "Run", name: "Morning 5K", distance: 5.2, duration: 28, calories: 420, date: "2026-04-04" },
    { id: 2, type: "Gym", name: "Upper body", distance: 0, duration: 55, calories: 380, date: "2026-04-03" },
    { id: 3, type: "Run", name: "Interval training", distance: 8.1, duration: 42, calories: 520, date: "2026-04-02" },
    { id: 4, type: "Cycling", name: "Evening ride", distance: 10.2, duration: 60, calories: 520, date: "2026-04-01" },
  ],
  weeklyDistances: [0, 5.2, 8.1, 0, 10.2, 0, 0],
};

export const notionGoals = {
  active: 5,
  completed: 12,
  goals: [
    { id: 1, title: "Launch Floopify v2", progress: 75, category: "Project", deadline: "2026-04-15" },
    { id: 2, title: "Run a half marathon", progress: 60, category: "Health", deadline: "2026-06-01" },
    { id: 3, title: "Read 24 books this year", progress: 33, category: "Learning", deadline: "2026-12-31" },
    { id: 4, title: "Save 50K NIS", progress: 45, category: "Finance", deadline: "2026-12-31" },
    { id: 5, title: "Learn Rust basics", progress: 20, category: "Learning", deadline: "2026-07-01" },
  ],
};

export const calendarEvents = [
  { id: 1, title: "Standup", time: "09:00", endTime: "09:15", color: "#14b8a6" },
  { id: 2, title: "Deep work: Floopify", time: "10:00", endTime: "12:00", color: "#8b5cf6" },
  { id: 3, title: "Lunch with Noa", time: "12:30", endTime: "13:30", color: "#f59e0b" },
  { id: 4, title: "1:1 with Manager", time: "14:00", endTime: "14:30", color: "#ef4444" },
  { id: 5, title: "Gym", time: "17:00", endTime: "18:00", color: "#22c55e" },
];

export const financeData = {
  portfolioTotal: 142850,
  dailyChange: 1.24,
  dailyChangeAmount: 1748,
  currency: "NIS",
  allocation: [
    { name: "Stocks", value: 55, color: "#14b8a6" },
    { name: "Crypto", value: 20, color: "#8b5cf6" },
    { name: "Bonds", value: 15, color: "#f59e0b" },
    { name: "Cash", value: 10, color: "#64748b" },
  ],
  weeklyValues: [140200, 141100, 140800, 141500, 142200, 142850, 142850],
};

export const sheetsData = {
  monthlyBudget: 8500,
  monthlySpent: 5230,
  categories: [
    { name: "Housing", budget: 3500, spent: 3500 },
    { name: "Food", budget: 2000, spent: 1230 },
    { name: "Transport", budget: 800, spent: 500 },
    { name: "Entertainment", budget: 700, spent: 0 },
    { name: "Other", budget: 1500, spent: 0 },
  ],
};

export const recentActivity = [
  { id: 1, action: "Completed morning meditation", type: "habit", time: "07:15", icon: "check-circle" },
  { id: 2, action: "Earned 15 NIS — Morning streak", type: "wallet", time: "07:16", icon: "coins" },
  { id: 3, action: "Logged 5.2km run", type: "health", time: "08:30", icon: "activity" },
  { id: 4, action: "Earned 10 NIS — Gym session", type: "wallet", time: "08:31", icon: "coins" },
  { id: 5, action: "Updated goal: Floopify v2 → 75%", type: "goal", time: "09:45", icon: "target" },
  { id: 6, action: "Completed reading habit", type: "habit", time: "12:00", icon: "check-circle" },
  { id: 7, action: "Journal entry saved", type: "habit", time: "13:00", icon: "pen-tool" },
  { id: 8, action: "Portfolio up +1.24%", type: "finance", time: "14:00", icon: "trending-up" },
  { id: 9, action: "No-sugar streak: day 12", type: "habit", time: "15:00", icon: "flame" },
  { id: 10, action: "Completed exercise habit", type: "habit", time: "17:45", icon: "check-circle" },
];

export const learningData = {
  currentStreak: 12,
  longestStreak: 21,
  totalHours: 148,
  weeklyMinutes: [45, 30, 60, 50, 40, 0, 0],
};
