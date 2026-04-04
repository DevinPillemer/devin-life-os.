"use client";

import { Target } from "lucide-react";

interface Goal {
  title: string;
  percent: number;
  category: string;
  due: string;
}

interface Props {
  goals: Goal[];
  active: number;
  loading: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  PROJECT: "#14b8a6",
  HEALTH: "#22c55e",
  LEARNING: "#a855f7",
  FINANCE: "#f59e0b",
};

function daysRemaining(due: string): number | null {
  if (!due) return null;
  const diff = new Date(due).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function GoalsSection({ goals, active, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
        <div className="w-32 h-4 skeleton rounded mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 skeleton rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Sort by urgency (closest deadline first)
  const sorted = [...goals].sort((a, b) => {
    const da = daysRemaining(a.due);
    const db = daysRemaining(b.due);
    if (da === null) return 1;
    if (db === null) return -1;
    return da - db;
  });

  return (
    <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Target size={14} className="text-violet-400" />
        Goals Progress
        <span className="ml-auto text-xs font-normal text-slate-500">
          {active} active
        </span>
      </h2>

      <div className="space-y-4">
        {sorted.map((g, i) => {
          const days = daysRemaining(g.due);
          const color = CATEGORY_COLORS[g.category] || "#8b5cf6";
          const almostThere = g.percent >= 90;

          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm text-white font-medium truncate">{g.title}</span>
                  {almostThere && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                      Almost there!
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0 tabular-nums">{g.percent}%</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${g.percent}%`, backgroundColor: color }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span
                  className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded"
                  style={{ color, backgroundColor: color + "15" }}
                >
                  {g.category}
                </span>
                <div className="flex items-center gap-2">
                  {days !== null && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      days <= 14 ? "bg-red-500/10 text-red-400" : "bg-slate-700/50 text-slate-500"
                    } tabular-nums`}>
                      {days}d left
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
