"use client";

import { useState } from "react";
import { Target, Plus } from "lucide-react";

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
  lastSynced?: string;
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

function progressFromDueDate(due: string): number {
  if (!due) return 0;
  const dueDate = new Date(due);
  const start = new Date(dueDate);
  start.setDate(dueDate.getDate() - 90);
  const totalWindow = dueDate.getTime() - start.getTime();
  const elapsed = Date.now() - start.getTime();
  return Math.max(0, Math.min(100, Math.round((elapsed / totalWindow) * 100)));
}

function formatLastSynced(lastSynced?: string) {
  if (!lastSynced) return "Not synced yet";
  const mins = Math.max(0, Math.floor((Date.now() - new Date(lastSynced).getTime()) / 60000));
  if (mins < 1) return "Last synced: just now";
  if (mins < 60) return `Last synced: ${mins} min ago`;
  return `Last synced: ${Math.floor(mins / 60)}h ago`;
}

export default function GoalsSection({ goals, active, loading, lastSynced }: Props) {
  const [quickAdd, setQuickAdd] = useState({ title: "", category: "PROJECT", priority: "Medium" });
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <div className="rounded-xl bg-surface border border-slate-700/50 p-5"><div className="w-32 h-4 skeleton rounded mb-4" /><div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 skeleton rounded" />)}</div></div>;
  }

  const sorted = [...goals].sort((a, b) => {
    const da = daysRemaining(a.due);
    const db = daysRemaining(b.due);
    if (da === null) return 1;
    if (db === null) return -1;
    return da - db;
  });

  const handleQuickAdd = async () => {
    if (!quickAdd.title.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickAdd),
      });
      setQuickAdd({ title: "", category: "PROJECT", priority: "Medium" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2"><Target size={14} className="text-violet-400" />Goals Progress</h2>
        <span className="ml-auto text-xs font-normal text-slate-500">{active} active</span>
      </div>
      <p className="text-[11px] text-slate-500 mb-4">{formatLastSynced(lastSynced)}</p>

      <div className="rounded-lg border border-slate-700/70 p-2.5 mb-4">
        <div className="flex items-center gap-2 mb-2 text-xs text-slate-300 font-semibold"><Plus size={12} className="text-violet-300" /> Quick Add Goal</div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input value={quickAdd.title} onChange={(e) => setQuickAdd((p) => ({ ...p, title: e.target.value }))} placeholder="Goal title" className="sm:col-span-2 bg-slate-800/70 border border-slate-700 rounded px-2 py-1.5 text-sm" />
          <select value={quickAdd.category} onChange={(e) => setQuickAdd((p) => ({ ...p, category: e.target.value }))} className="bg-slate-800/70 border border-slate-700 rounded px-2 py-1.5 text-sm">
            <option>PROJECT</option><option>HEALTH</option><option>LEARNING</option><option>FINANCE</option>
          </select>
          <select value={quickAdd.priority} onChange={(e) => setQuickAdd((p) => ({ ...p, priority: e.target.value }))} className="bg-slate-800/70 border border-slate-700 rounded px-2 py-1.5 text-sm">
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>
        <button onClick={handleQuickAdd} disabled={submitting} className="mt-2 text-xs px-2.5 py-1.5 rounded bg-violet-500/20 border border-violet-500/40 text-violet-200 hover:bg-violet-500/30 disabled:opacity-60">{submitting ? "Adding..." : "Add to Notion"}</button>
      </div>

      <div className="space-y-4">
        {sorted.map((g, i) => {
          const days = daysRemaining(g.due);
          const color = CATEGORY_COLORS[g.category] || "#8b5cf6";
          const dueProgress = progressFromDueDate(g.due);
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5"><div className="flex items-center gap-2 min-w-0"><span className="text-sm text-white font-medium truncate">{g.title}</span></div><span className="text-xs text-slate-400 flex-shrink-0 tabular-nums">{g.percent}%</span></div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${g.percent}%`, backgroundColor: color }} /></div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden mt-1"><div className="h-full rounded-full bg-violet-400/70" style={{ width: `${dueProgress}%` }} /></div>
              <div className="flex items-center justify-between mt-1"><span className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded" style={{ color, backgroundColor: color + "15" }}>{g.category}</span><div className="flex items-center gap-2">{days !== null && <span className={`text-[10px] px-1.5 py-0.5 rounded ${days <= 14 ? "bg-red-500/10 text-red-400" : "bg-slate-700/50 text-slate-500"} tabular-nums`}>{days}d left</span>}</div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
