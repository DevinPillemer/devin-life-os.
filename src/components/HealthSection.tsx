"use client";

import { Activity, TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  health: any;
  loading: boolean;
}

const ACTIVITY_ICONS: Record<string, string> = {
  running: "🏃",
  cycling: "🚴",
  gym: "🏋️",
  swim: "🏊",
  walking: "🚶",
  hiking: "🥾",
  yoga: "🧘",
  workout: "💪",
};

function intensityColor(minutes: number): string {
  if (minutes === 0) return "bg-slate-800";
  if (minutes < 20) return "bg-emerald-900/60";
  if (minutes < 40) return "bg-emerald-700/60";
  if (minutes < 60) return "bg-emerald-500/60";
  return "bg-emerald-400/70";
}

function GoalRing({ completed, target }: { completed: number; target: number }) {
  const size = 48;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(completed / target, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-700" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="text-amber-400 transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center"><span className="text-[10px] font-bold text-white tabular-nums">{completed}/{target}</span></div>
    </div>
  );
}

function formatLastSynced(lastSynced?: string) {
  if (!lastSynced) return "Not synced yet";
  const mins = Math.max(0, Math.floor((Date.now() - new Date(lastSynced).getTime()) / 60000));
  if (mins < 1) return "Last synced: just now";
  if (mins < 60) return `Last synced: ${mins} min ago`;
  return `Last synced: ${Math.floor(mins / 60)}h ago`;
}

export default function HealthSection({ health, loading }: Props) {
  if (loading) {
    return <div className="rounded-xl bg-surface border border-slate-700/50 p-5"><div className="w-32 h-4 skeleton rounded mb-4" /><div className="h-20 skeleton rounded mb-4" /><div className="h-16 skeleton rounded" /></div>;
  }

  const weekChart = health?.weekChart || [];
  const vsLastWeek = health?.vsLastWeek || { kmDelta: 0, sessionsDelta: 0 };
  const weeklyGoal = health?.weeklyGoal || { target: 5, completed: 0 };

  return (
    <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2"><Activity size={14} className="text-emerald-400" />Health This Week</h2>
        <GoalRing completed={weeklyGoal.completed} target={weeklyGoal.target} />
      </div>
      <p className="text-[11px] text-slate-500 mb-3">{formatLastSynced(health?.lastSynced)}</p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center"><div className="text-lg font-bold text-white tabular-nums">{health?.sessions || 0}</div><div className="text-[10px] text-slate-400 uppercase">Sessions</div></div>
        <div className="text-center"><div className="text-lg font-bold text-white tabular-nums">{health?.totalKm || 0}km</div><div className="text-[10px] text-slate-400 uppercase">Distance</div></div>
        <div className="text-center"><div className="text-lg font-bold text-white tabular-nums">{health?.totalMinutes || 0}m</div><div className="text-[10px] text-slate-400 uppercase">Duration</div></div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-xs">
        <span className={`flex items-center gap-0.5 font-medium ${vsLastWeek.kmDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}>{vsLastWeek.kmDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{vsLastWeek.kmDelta >= 0 ? "+" : ""}{vsLastWeek.kmDelta}km</span>
        <span className="text-slate-500">vs last week</span>
      </div>

      <div className="mb-4">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Week Activity</div>
        <div className="grid grid-cols-7 gap-1.5">
          {weekChart.map((day: any, i: number) => (
            <div key={i} className="text-center"><div className="text-[9px] text-slate-500 mb-1">{day.day}</div><div className={`aspect-square rounded-md flex items-center justify-center text-[9px] text-slate-300 font-medium ${intensityColor(day.minutes)}`} title={`${day.km}km / ${day.minutes}min`}>{day.minutes > 0 ? `${day.minutes}m` : ""}</div></div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {(health?.activities || []).map((a: any, i: number) => (
          <div key={i} className="flex items-center justify-between text-xs py-1.5">
            <div className="flex items-center gap-2"><span className="text-base">{ACTIVITY_ICONS[String(a.type).toLowerCase()] || "✨"}</span><div><span className="text-slate-300 font-medium">{a.label}</span><span className="text-slate-500 ml-1.5 capitalize">{a.type}</span></div></div>
            <div className="text-slate-500 tabular-nums">{a.km > 0 ? `${a.km}km · ` : ""}{a.minutes}min</div>
          </div>
        ))}
      </div>
    </div>
  );
}
