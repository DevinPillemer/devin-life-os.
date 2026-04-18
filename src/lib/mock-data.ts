// ── Mock Data for all API routes ──
// Used as fallback when real APIs are unavailable

export const walletData = {
  spent: 5230,
  limit: 8500,
  currency: "NIS",
  weeklySpending: [680, 920, 750, 1100, 830, 650, 300],
  yesterdaySpent: 4580,
  breakdown: [
    { category: "Housing", spent: 3500, limit: 3500 },
    { category: "Food", spent: 1230, limit: 2000 },
    { category: "Transport", spent: 500, limit: 800 },
    { category: "Entertainment", spent: 0, limit: 700 },
    { category: "Other", spent: 0, limit: 1500 },
  ],
};

export const habitsData = {
  date: "2026-04-04",
  completed: 5,
  total: 8,
  pointsEarned: 35,
  pointsTotal: 55,
  habits: [
    { id: 1, name: "Morning meditation", points: 5, done: true, icon: "brain", streak: 12 },
    { id: 2, name: "Exercise", points: 10, done: true, icon: "dumbbell", streak: 8 },
    { id: 3, name: "Read 30 min", points: 5, done: true, icon: "book-open", streak: 21 },
    { id: 4, name: "Journal", points: 5, done: true, icon: "pen-tool", streak: 5 },
    { id: 5, name: "No sugar", points: 10, done: true, icon: "apple", streak: 12 },
    { id: 6, name: "Cold shower", points: 5, done: false, icon: "droplets", streak: 0 },
    { id: 7, name: "Walk 10k steps", points: 10, done: false, icon: "footprints", streak: 3 },
    { id: 8, name: "Sleep by 11pm", points: 5, done: false, icon: "moon", streak: 1 },
  ],
};

export const stravaData = {
  sessions: 4,
  totalKm: 23.5,
  totalMinutes: 185,
  weeklyGoal: { target: 5, completed: 4 },
  vsLastWeek: { kmDelta: 2.3, sessionsDelta: 1 },
  weekChart: [
    { day: "Mon", km: 0, minutes: 0 },
    { day: "Tue", km: 5.2, minutes: 28 },
    { day: "Wed", km: 8.1, minutes: 42 },
    { day: "Thu", km: 0, minutes: 55 },
    { day: "Fri", km: 10.2, minutes: 60 },
    { day: "Sat", km: 0, minutes: 0 },
    { day: "Sun", km: 0, minutes: 0 },
  ],
  activities: [
    { type: "running", label: "Morning 5K", km: 5.2, minutes: 28 },
    { type: "gym", label: "Upper body", km: 0, minutes: 55 },
    { type: "running", label: "Interval training", km: 8.1, minutes: 42 },
    { type: "cycling", label: "Evening ride", km: 10.2, minutes: 60 },
  ],
};

export const notionGoals = {
  active: 5,
  totalCompleted: 12,
  goals: [
    { title: "Launch Floopify v2", percent: 75, category: "PROJECT", due: "2026-04-15" },
    { title: "Run a half marathon", percent: 60, category: "HEALTH", due: "2026-06-01" },
    { title: "Read 24 books this year", percent: 33, category: "LEARNING", due: "2026-12-31" },
    { title: "Save 50K NIS", percent: 45, category: "FINANCE", due: "2026-12-31" },
    { title: "Learn Rust basics", percent: 92, category: "LEARNING", due: "2026-07-01" },
  ],
};

export const calendarEvents = [
  { title: "Standup", start: "09:00", end: "09:15", color: "#14b8a6" },
  { title: "Deep work: Floopify", start: "10:00", end: "12:00", color: "#8b5cf6" },
  { title: "Lunch with Noa", start: "12:30", end: "13:30", color: "#f59e0b" },
  { title: "1:1 with Manager", start: "14:00", end: "14:30", color: "#ef4444" },
  { title: "Gym", start: "17:00", end: "18:00", color: "#22c55e" },
];


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
  { id: 11, action: "Wallet topped up +₪200", type: "wallet", time: "18:00", icon: "coins" },
  { id: 12, action: "Strava sync complete", type: "health", time: "18:15", icon: "activity" },
];

export const learningData = {
  streakDays: 12,
  bestStreak: 21,
  todayDone: true,
  currentModule: "Rust Ownership & Borrowing",
  recentSessions: [
    { date: "2026-04-04", topic: "Rust Ownership", minutes: 45 },
    { date: "2026-04-03", topic: "Rust Structs", minutes: 30 },
    { date: "2026-04-02", topic: "Rust Enums", minutes: 60 },
    { date: "2026-04-01", topic: "Rust Functions", minutes: 50 },
    { date: "2026-03-31", topic: "Rust Variables", minutes: 40 },
  ],
};

export const sleepData = {
  duration: 7.5,
  bedtime: "23:15",
  wakeTime: "06:45",
  quality: "good",
  deepSleep: 1.8,
  streak: 5,
};
