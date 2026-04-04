"use client";

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

// Circular progress ring
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-700"
        />
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

export default function HabitsSection({ habits, pointsEarned, pointsTotal, loading, onToggle }: Props) {
  const completed = habits.filter((h) => h.done);
  const pending = habits.filter((h) => !h.done);
  const sorted = [...pending, ...completed];

  if (loading) {
    return (
      <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
        <div className="w-32 h-4 skeleton rounded mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 skeleton rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
      <div className="flex items-center gap-3 mb-4">
        <ProgressRing completed={completed.length} total={habits.length} />
        <div>
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Today&apos;s Habits
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {pointsEarned}/{pointsTotal} pts earned
          </p>
        </div>
      </div>

      <div className="space-y-1">
        {sorted.map((h) => (
          <button
            key={h.id}
            onClick={() => onToggle(h.id)}
            className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all text-left ${
              h.done ? "bg-accent/10 hover:bg-accent/15 opacity-60" : "hover:bg-slate-700/30"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                h.done ? "bg-accent border-accent" : "border-slate-600"
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
            {h.streak > 1 && (
              <span className="text-[10px] text-orange-400 flex items-center gap-0.5 flex-shrink-0">
                <Flame size={10} />
                {h.streak}
              </span>
            )}
            <span className="text-slate-500 flex-shrink-0">{habitIcons[h.icon]}</span>
            <span className="text-xs text-slate-500 flex-shrink-0 tabular-nums">+{h.points}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
