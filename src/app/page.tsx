"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { useState, useEffect, useCallback, useRef } from "react";
import { SWRConfig, useSWRConfig } from "swr";
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

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
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
  return <div ref={ref} id={id} className="fade-section">{children}</div>;
}

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
      document.documentElement.classList.toggle("dark", next);
      document.documentElement.classList.toggle("light", !next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  return { dark, toggle };
}

function DashboardInner() {
  const { mutate } = useSWRConfig();
  const { finance, financeLoading } = useFinance();
  const { wallet, walletLoading } = useWallet();
  const { habits: habitsData, habitsLoading } = useHabits();
  const { health, healthLoading } = useHealth();
  const { goals: goalsData, goalsLoading } = useGoals();
  const { learning, learningLoading } = useLearning();
  const { calendar, calendarLoading } = useCalendar();

  const [localHabits, setLocalHabits] = useState<any[]>([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [syncingHabits, setSyncingHabits] = useState(false);
  const [syncingHabitsNotion, setSyncingHabitsNotion] = useState(false);
  const { dark, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    if (habitsData?.habits) setLocalHabits(habitsData.habits);
  }, [habitsData]);

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

  const toggleHabit = (id: number) => setLocalHabits((prev) => prev.map((h) => (h.id === id ? { ...h, done: !h.done } : h)));

  const handleHabitsSync = async () => {
    setSyncingHabits(true);
    await mutate("/api/habits");
    setSyncingHabits(false);
  };

  const handleNotionSync = async () => {
    setSyncingHabitsNotion(true);
    await fetch("/api/habits/sync-notion", { method: "POST" });
    setSyncingHabitsNotion(false);
  };

  const completedCount = localHabits.filter((h) => h.done).length;
  const totalHabits = localHabits.length;
  const pointsEarned = localHabits.filter((h) => h.done).reduce((s, h) => s + (h.points || 0), 0);
  const pointsTotal = localHabits.reduce((s, h) => s + (h.points || 0), 0);
  const walletProgress = wallet?.limit ? Math.min(100, Math.round((wallet.spent / wallet.limit) * 100)) : 0;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-surface-dark" : "bg-slate-50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>
              {getGreeting()}, <span className="text-accent">Devin</span>
            </h1>
            <p className={`text-sm mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>{formatDate()} · Week {getWeekNumber()}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCmdOpen(true)} className={`p-2 rounded-lg transition-colors ${dark ? "hover:bg-slate-700/50 text-slate-400" : "hover:bg-slate-200 text-slate-500"}`} title="Cmd+K"><Command size={16} /></button>
            <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${dark ? "hover:bg-slate-700/50 text-slate-400" : "hover:bg-slate-200 text-slate-500"}`} title="Toggle theme">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
          </div>
        </header>

        <section className="mb-6 rounded-2xl border border-teal-400/20 bg-gradient-to-r from-teal-500/15 via-cyan-500/10 to-violet-500/10 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-teal-200/80">Daily overview</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white leading-tight">Keep momentum across health, learning, and goals.</h2>
              <p className="text-sm text-slate-300 mt-1">Wallet progress is synced live from your tracker data.</p>
            </div>
            <div className="min-w-[220px]">
              <div className="flex justify-between text-xs text-slate-300 mb-1"><span>Wallet Progress</span><span>{walletProgress}%</span></div>
              <div className="h-2.5 rounded-full bg-slate-800/70 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 shadow-[0_0_16px_rgba(45,212,191,0.55)] transition-all duration-700" style={{ width: `${walletProgress}%` }} />
              </div>
            </div>
          </div>
        </section>

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

        <FadeSection id="section-calendar"><div className="mb-6"><CalendarTimeline events={calendar?.events || []} loading={calendarLoading} /></div></FadeSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-4 sm:space-y-6">
            <FadeSection id="section-habits">
              <HabitsSection
                habits={localHabits}
                pointsEarned={pointsEarned}
                pointsTotal={pointsTotal}
                loading={habitsLoading}
                syncing={syncingHabits}
                syncingNotion={syncingHabitsNotion}
                onSync={handleHabitsSync}
                onSyncNotion={handleNotionSync}
                lastSynced={habitsData?.lastSynced}
                onToggle={toggleHabit}
              />
            </FadeSection>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <FadeSection id="section-finance"><FinanceSection finance={finance} loading={financeLoading} /></FadeSection>
            <FadeSection id="section-health"><HealthSection health={health} loading={healthLoading} /></FadeSection>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <FadeSection id="section-goals"><GoalsSection goals={goalsData?.goals || []} active={goalsData?.active || 0} loading={goalsLoading} lastSynced={goalsData?.lastSynced} /></FadeSection>
            <FadeSection id="section-activity"><ActivityFeed activities={recentActivity} loading={false} /></FadeSection>
          </div>
        </div>

        <footer className={`mt-10 text-center text-xs ${dark ? "text-slate-600" : "text-slate-400"}`}>Floopify v2 · Built with Next.js, Tailwind & Recharts</footer>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}

export default function Dashboard() {
  return <SWRConfig value={{ revalidateOnFocus: false }}><DashboardInner /></SWRConfig>;
}
