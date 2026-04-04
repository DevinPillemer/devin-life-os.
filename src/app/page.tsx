"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SWRConfig } from "swr";
import {
  useFinance,
  useWallet,
  useHabits,
  useHealth,
  useGoals,
  useLearning,
  useCalendar,
} from "@/lib/hooks";
import { recentActivity } from "@/lib/mock-data";
import KpiCards from "@/components/KpiCards";
import CalendarTimeline from "@/components/CalendarTimeline";
import HabitsSection from "@/components/HabitsSection";
import FinanceSection from "@/components/FinanceSection";
import HealthSection from "@/components/HealthSection";
import GoalsSection from "@/components/GoalsSection";
import ActivityFeed from "@/components/ActivityFeed";
import CommandPalette from "@/components/CommandPalette";
import { Sun, Moon, Command } from "lucide-react";

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

// ── IntersectionObserver hook for fade-in ──
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function FadeSection({ children, id }: { children: React.ReactNode; id?: string }) {
  const ref = useFadeIn();
  return (
    <div ref={ref} id={id} className="fade-section">
      {children}
    </div>
  );
}

// ── Theme toggle ──
function useTheme() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light") {
      setDark(false);
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  }, []);

  return { dark, toggle };
}

// ── Dashboard Inner (uses SWR hooks) ──
function DashboardInner() {
  const { finance, financeLoading } = useFinance();
  const { wallet, walletLoading } = useWallet();
  const { habits: habitsData, habitsLoading } = useHabits();
  const { health, healthLoading } = useHealth();
  const { goals: goalsData, goalsLoading } = useGoals();
  const { learning, learningLoading } = useLearning();
  const { calendar, calendarLoading } = useCalendar();

  const [localHabits, setLocalHabits] = useState<any[]>([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const { dark, toggle: toggleTheme } = useTheme();

  // Sync habits from API
  useEffect(() => {
    if (habitsData?.habits) {
      setLocalHabits(habitsData.habits);
    }
  }, [habitsData]);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggleHabit = (id: number) => {
    setLocalHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, done: !h.done } : h))
    );
  };

  const completedCount = localHabits.filter((h) => h.done).length;
  const totalHabits = localHabits.length;
  const pointsEarned = localHabits
    .filter((h) => h.done)
    .reduce((s, h) => s + (h.points || 0), 0);
  const pointsTotal = localHabits.reduce((s, h) => s + (h.points || 0), 0);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-surface-dark" : "bg-slate-50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* ── Header ── */}
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>
              {getGreeting()}, <span className="text-accent">Devin</span>
            </h1>
            <p className={`text-sm mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>
              {formatDate()} · Week {getWeekNumber()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCmdOpen(true)}
              className={`p-2 rounded-lg transition-colors ${dark ? "hover:bg-slate-700/50 text-slate-400" : "hover:bg-slate-200 text-slate-500"}`}
              title="Cmd+K"
            >
              <Command size={16} />
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${dark ? "hover:bg-slate-700/50 text-slate-400" : "hover:bg-slate-200 text-slate-500"}`}
              title="Toggle theme"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* ── KPI Cards ── */}
        <div id="section-kpi">
          <KpiCards
            wallet={wallet}
            walletLoading={walletLoading}
            finance={finance}
            financeLoading={financeLoading}
            habits={habitsData}
            habitsLoading={habitsLoading}
            health={health}
            healthLoading={healthLoading}
            goals={goalsData}
            goalsLoading={goalsLoading}
            learning={learning}
            learningLoading={learningLoading}
            completedHabits={completedCount}
            totalHabits={totalHabits}
          />
        </div>

        {/* ── Calendar Timeline ── */}
        <FadeSection id="section-calendar">
          <div className="mb-6">
            <CalendarTimeline
              events={calendar?.events || []}
              loading={calendarLoading}
            />
          </div>
        </FadeSection>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Col 1: Habits */}
          <div className="space-y-4 sm:space-y-6">
            <FadeSection id="section-habits">
              <HabitsSection
                habits={localHabits}
                pointsEarned={pointsEarned}
                pointsTotal={pointsTotal}
                loading={habitsLoading}
                onToggle={toggleHabit}
              />
            </FadeSection>
          </div>

          {/* Col 2: Finance + Health */}
          <div className="space-y-4 sm:space-y-6">
            <FadeSection id="section-finance">
              <FinanceSection finance={finance} loading={financeLoading} />
            </FadeSection>
            <FadeSection id="section-health">
              <HealthSection health={health} loading={healthLoading} />
            </FadeSection>
          </div>

          {/* Col 3: Goals + Activity */}
          <div className="space-y-4 sm:space-y-6">
            <FadeSection id="section-goals">
              <GoalsSection
                goals={goalsData?.goals || []}
                active={goalsData?.active || 0}
                loading={goalsLoading}
              />
            </FadeSection>
            <FadeSection id="section-activity">
              <ActivityFeed
                activities={recentActivity}
                loading={false}
              />
            </FadeSection>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className={`mt-10 text-center text-xs ${dark ? "text-slate-600" : "text-slate-400"}`}>
          Floopify v2 · Built with Next.js, Tailwind & Recharts
        </footer>
      </div>

      {/* Command palette */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}

// ── Root page wrapping with SWRConfig ──
export default function Dashboard() {
  return (
    <SWRConfig value={{ revalidateOnFocus: false }}>
      <DashboardInner />
    </SWRConfig>
  );
}
