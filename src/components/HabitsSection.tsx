"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Brain,
  Dumbbell,
  BookOpen,
  PenTool,
  Apple,
  Droplets,
  Footprints,
  Moon,
  Flame,
  ChevronDown,
  RefreshCcw,
  Database,
} from "lucide-react";

interface Habit {
  id: number;
  name: string;
  points: number;
  done: boolean;
  icon: string;
  streak: number;
}

interface Props {
  habits: Habit[];
  pointsEarned: number;
  pointsTotal: number;
  loading: boolean;
  syncing?: boolean;
  syncingNotion?: boolean;
  onSync?: () => void;
  onSyncNotion?: () => void;
  lastSynced?: string;
  onToggle: (id: number) => void;
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

function ProgressRing({ completed, total }: { completed: number; total: number }) {
  const size = 56;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? completed / total : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-700" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-emerald-400 transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white tabular-nums">
          {completed}/{total}
        </span>
      </div>
    </div>
  );
}

const orderedCategories = ["Health", "Focus", "Learning", "Spiritual", "Lifestyle"];

function inferCategory(name: string): string {
  const lower = name.toLowerCase();
  if (["gym", "run", "walk", "swim", "steps", "sleep", "water", "protein", "workout"].some((k) => lower.includes(k))) return "Health";
  if (["focus", "deep work", "plan", "todo", "priority", "budget check", "budget"].some((k) => lower.includes(k))) return "Focus";
  if (["read", "study", "course", "learn", "book", "blink"].some((k) => lower.includes(k))) return "Learning";
  if (["pray", "faith", "gratitude", "meditation", "journal", "scripture"].some((k) => lower.includes(k))) return "Spiritual";
  return "Lifestyle";
}

function formatLastSynced(lastSynced?: string) {
  if (!lastSynced) return "Not synced yet";
  const diffMs = Date.now() - new Date(lastSynced).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  if (mins < 1) return "Last synced: just now";
  if (mins < 60) return `Last synced: ${mins} min ago`;
  return `Last synced: ${Math.floor(mins / 60)}h ago`;
}

export default function HabitsSection({
  habits,
  pointsEarned,
  pointsTotal,
  loading,
  syncing,
  syncingNotion,
  onSync,
  onSyncNotion,
  lastSynced,
  onToggle,
}: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const groups = new Map<string, Habit[]>();
    for (const cat of orderedCategories) groups.set(cat, []);
    for (const habit of habits) {
      const category = inferCategory(habit.name);
      groups.get(category)?.push(habit);
    }
    return groups;
  }, [habits]);

  const completed = habits.filter((h) => h.done);

  if (loading) {
    return (
      <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
        <div className="w-32 h-4 skeleton rounded mb-4" />
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 skeleton rounded" />)}</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <ProgressRing completed={completed.length} total={habits.length} />
          <div>
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              Today&apos;s Habits
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">{pointsEarned}/{pointsTotal} pts earned</p>
            <p className="text-[11px] text-slate-500 mt-1">{formatLastSynced(lastSynced)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSync}
            disabled={syncing}
            className="text-xs px-2.5 py-1.5 rounded-md border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-1"><RefreshCcw size={12} className={syncing ? "animate-spin" : ""} /> Sync Now</span>
          </button>
          <button
            onClick={onSyncNotion}
            disabled={syncingNotion}
            className="text-xs px-2.5 py-1.5 rounded-md border border-violet-500/30 text-violet-300 hover:bg-violet-500/10 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-1"><Database size={12} className={syncingNotion ? "animate-pulse" : ""} /> Sync to Notion</span>
          </button>
        </div>
      </div>

      <div>
        {orderedCategories.map((category, index) => {
          const items = grouped.get(category) || [];
          const isCollapsed = collapsed[category] ?? false;
          return (
            <div key={category} className={index > 0 ? "border-t border-slate-700/40 pt-2 mt-2" : ""}>
              <button
                onClick={() => setCollapsed((prev) => ({ ...prev, [category]: !isCollapsed }))}
                className="w-full text-left flex items-center justify-between py-2"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{category} <span className="text-slate-500">({items.length})</span></span>
                <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${isCollapsed ? "-rotate-90" : "rotate-0"}`} />
              </button>
              <div className={`grid transition-all duration-300 ease-out ${isCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}>
                <div className="overflow-hidden">
                  <div className="space-y-0.5 pb-1">
                    {items.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => onToggle(h.id)}
                        className={`w-full flex items-center gap-3 py-1.5 px-2 rounded-lg transition-all text-left ${h.done ? "bg-accent/10 hover:bg-accent/15 opacity-60" : "hover:bg-slate-700/30"}`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${h.done ? "bg-accent border-accent" : "border-slate-600"}`}>
                          {h.done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <span className={`text-sm flex-1 ${h.done ? "text-slate-400 line-through" : "text-white"}`}>{h.name}</span>
                        {h.streak > 1 && <span className="text-[10px] text-orange-400 flex items-center gap-0.5 flex-shrink-0"><Flame size={10} />{h.streak}</span>}
                        <span className="text-slate-500 flex-shrink-0">{habitIcons[h.icon]}</span>
                        <span className="text-xs text-slate-500 flex-shrink-0 tabular-nums">+{h.points}</span>
                      </button>
                    ))}
                    {items.length === 0 && <p className="text-xs text-slate-500 px-2 py-1">No habits in this category.</p>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
