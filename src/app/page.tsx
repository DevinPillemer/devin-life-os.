"use client";

import { useState } from "react";
import {
  walletData,
  habitsData,
  stravaData,
  notionGoals,
  calendarEvents,
  financeData,
  recentActivity,
  learningData,
} from "@/lib/mock-data";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Wallet,
  CheckCircle2,
  Activity,
  Target,
  BookOpen,
  Clock,
  TrendingUp,
  TrendingDown,
  Coins,
  PenTool,
  Flame,
  Droplets,
  Footprints,
  Moon,
  Apple,
  Dumbbell,
  Brain,
  Calendar,
  ChevronRight,
} from "lucide-react";

// ── Helpers ──
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const habitIcons: Record<string, React.ReactNode> = {
  brain: <Brain size={16} />,
  dumbbell: <Dumbbell size={16} />,
  "book-open": <BookOpen size={16} />,
  "pen-tool": <PenTool size={16} />,
  apple: <Apple size={16} />,
  droplets: <Droplets size={16} />,
  footprints: <Footprints size={16} />,
  moon: <Moon size={16} />,
};

const activityIcons: Record<string, React.ReactNode> = {
  "check-circle": <CheckCircle2 size={14} className="text-accent" />,
  coins: <Coins size={14} className="text-gold" />,
  activity: <Activity size={14} className="text-emerald-400" />,
  target: <Target size={14} className="text-violet-400" />,
  "pen-tool": <PenTool size={14} className="text-blue-400" />,
  "trending-up": <TrendingUp size={14} className="text-gold" />,
  flame: <Flame size={14} className="text-orange-400" />,
};

// ── Sparkline component ──
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#grad-${color.replace("#", "")})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── KPI Card ──
function KpiCard({
  icon,
  label,
  value,
  sub,
  sparkData,
  sparkColor,
  progress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  sparkData?: number[];
  sparkColor?: string;
  progress?: number;
}) {
  return (
    <div className="rounded-xl bg-surface p-4 border border-slate-700/50 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
          {icon}
          {label}
        </div>
        {sparkData && <Sparkline data={sparkData} color={sparkColor || "#14b8a6"} />}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: `linear-gradient(90deg, ${sparkColor || "#14b8a6"}, ${sparkColor || "#14b8a6"}cc)`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Main Page ──
export default function Dashboard() {
  const [habits, setHabits] = useState(habitsData.habits);

  const completedCount = habits.filter((h) => h.done).length;
  const habitPercent = Math.round((completedCount / habits.length) * 100);

  const toggleHabit = (id: number) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, done: !h.done } : h)));
  };

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const distanceChart = stravaData.weeklyDistances.map((d, i) => ({ day: weekDays[i], km: d }));

  return (
    <div className="min-h-screen bg-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* ── Greeting ── */}
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {getGreeting()}, <span className="text-accent">Devin</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {formatDate()} · Week {getWeekNumber()}
          </p>
        </header>

        {/* ── KPI Row ── */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <KpiCard
            icon={<Wallet size={14} />}
            label="Wallet"
            value={`₪${walletData.totalEarned}`}
            sub={`of ₪${walletData.maxBudget} max`}
            sparkData={walletData.weeklyEarnings}
            sparkColor="#14b8a6"
            progress={(walletData.totalEarned / walletData.maxBudget) * 100}
          />
          <KpiCard
            icon={<CheckCircle2 size={14} />}
            label="Habits"
            value={`${habitPercent}%`}
            sub={`${completedCount}/${habits.length} today`}
            sparkData={[3, 5, 7, 6, 8, 5, completedCount]}
            sparkColor="#22c55e"
            progress={habitPercent}
          />
          <KpiCard
            icon={<Activity size={14} />}
            label="Health"
            value={`${stravaData.weekSessions}`}
            sub="sessions this week"
            sparkData={stravaData.weeklyDistances}
            sparkColor="#f59e0b"
          />
          <KpiCard
            icon={<Target size={14} />}
            label="Goals"
            value={`${notionGoals.active}`}
            sub={`${notionGoals.completed} completed`}
            sparkData={[8, 9, 10, 10, 11, 12, 12]}
            sparkColor="#8b5cf6"
          />
          <KpiCard
            icon={<BookOpen size={14} />}
            label="Learning"
            value={`${learningData.currentStreak}d`}
            sub={`best: ${learningData.longestStreak}d`}
            sparkData={learningData.weeklyMinutes}
            sparkColor="#ec4899"
          />
        </section>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* ── Col 1: Calendar + Habits ── */}
          <div className="space-y-4 sm:space-y-6">
            {/* Calendar */}
            <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar size={14} className="text-accent" />
                Today&apos;s Calendar
              </h2>
              <div className="space-y-2">
                {calendarEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-700/30 transition-colors"
                  >
                    <div
                      className="w-1 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: evt.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{evt.title}</div>
                      <div className="text-xs text-slate-400">
                        {evt.time} – {evt.endTime}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Habits */}
            <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                Today&apos;s Habits
                <span className="ml-auto text-xs font-normal text-slate-500">
                  {completedCount}/{habits.length}
                </span>
              </h2>
              <div className="space-y-1">
                {habits.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => toggleHabit(h.id)}
                    className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all text-left ${
                      h.done
                        ? "bg-accent/10 hover:bg-accent/15"
                        : "hover:bg-slate-700/30"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        h.done
                          ? "bg-accent border-accent"
                          : "border-slate-600"
                      }`}
                    >
                      {h.done && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm flex-1 ${h.done ? "text-slate-400 line-through" : "text-white"}`}>
                      {h.name}
                    </span>
                    <span className="text-slate-500 flex-shrink-0">{habitIcons[h.icon]}</span>
                    <span className="text-xs text-slate-500 flex-shrink-0">+{h.points}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Col 2: Finance + Health ── */}
          <div className="space-y-4 sm:space-y-6">
            {/* Finance */}
            <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Coins size={14} className="text-gold" />
                Finance Snapshot
              </h2>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-white">
                  ₪{financeData.portfolioTotal.toLocaleString()}
                </span>
                <span
                  className={`text-sm font-medium flex items-center gap-0.5 ${
                    financeData.dailyChange >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {financeData.dailyChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {financeData.dailyChange >= 0 ? "+" : ""}
                  {financeData.dailyChange}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                {financeData.dailyChange >= 0 ? "+" : ""}₪{financeData.dailyChangeAmount.toLocaleString()} today
              </p>

              {/* Portfolio chart */}
              <div className="h-32 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={financeData.weeklyValues.map((v, i) => ({ day: weekDays[i], v }))}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="finGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2} fill="url(#finGrad)" dot={false} />
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }}
                      labelStyle={{ color: "#94a3b8" }}
                      formatter={(val: number) => [`₪${val.toLocaleString()}`, "Portfolio"]}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Donut */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={financeData.allocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={42}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {financeData.allocation.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5">
                  {financeData.allocation.map((a) => (
                    <div key={a.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
                      <span className="text-slate-400">{a.name}</span>
                      <span className="text-slate-300 font-medium">{a.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Health */}
            <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity size={14} className="text-emerald-400" />
                Health This Week
              </h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{stravaData.weekSessions}</div>
                  <div className="text-[10px] text-slate-400 uppercase">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{stravaData.weekDistance}km</div>
                  <div className="text-[10px] text-slate-400 uppercase">Distance</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{stravaData.weekDuration}m</div>
                  <div className="text-[10px] text-slate-400 uppercase">Duration</div>
                </div>
              </div>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distanceChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }}
                      formatter={(val: number) => [`${val}km`, "Distance"]}
                    />
                    <Bar dataKey="km" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {stravaData.activities.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-xs py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-accent font-medium">{a.type}</span>
                      <span className="text-slate-300">{a.name}</span>
                    </div>
                    <div className="text-slate-500">
                      {a.distance > 0 ? `${a.distance}km · ` : ""}{a.duration}min
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Col 3: Goals + Activity ── */}
          <div className="space-y-4 sm:space-y-6">
            {/* Goals */}
            <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Target size={14} className="text-violet-400" />
                Goals Progress
                <span className="ml-auto text-xs font-normal text-slate-500">
                  {notionGoals.active} active
                </span>
              </h2>
              <div className="space-y-4">
                {notionGoals.goals.map((g) => (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-white font-medium truncate mr-2">{g.title}</span>
                      <span className="text-xs text-slate-400 flex-shrink-0">{g.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${g.progress}%`,
                          background:
                            g.category === "Health"
                              ? "#22c55e"
                              : g.category === "Finance"
                              ? "#f59e0b"
                              : g.category === "Learning"
                              ? "#ec4899"
                              : "#8b5cf6",
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-500 uppercase">{g.category}</span>
                      <span className="text-[10px] text-slate-500">Due {g.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                Recent Activity
              </h2>
              <div className="space-y-0.5">
                {recentActivity.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-700/20 transition-colors"
                  >
                    <div className="flex-shrink-0">{activityIcons[a.icon] || <Activity size={14} className="text-slate-400" />}</div>
                    <span className="text-sm text-slate-300 flex-1 truncate">{a.action}</span>
                    <span className="text-[10px] text-slate-500 flex-shrink-0">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="mt-10 text-center text-xs text-slate-600">
          Floopify v2 · Built with Next.js, Tailwind & Recharts
        </footer>
      </div>
    </div>
  );
}
