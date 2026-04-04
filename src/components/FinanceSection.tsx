"use client";

import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Coins, TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  finance: any;
  loading: boolean;
}

const ALLOC_COLORS: Record<string, string> = {
  stocks: "#14b8a6",
  crypto: "#8b5cf6",
  bonds: "#f59e0b",
  cash: "#64748b",
};

export default function FinanceSection({ finance, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
        <div className="w-32 h-4 skeleton rounded mb-4" />
        <div className="h-32 skeleton rounded mb-4" />
        <div className="h-6 skeleton rounded" />
      </div>
    );
  }

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chartData = (finance?.weekTrend || []).map((v: number, i: number) => ({
    day: weekDays[i] || `D${i}`,
    v,
  }));

  const allocation = finance?.allocation || { stocks: 55, crypto: 20, bonds: 15, cash: 10 };
  const totalAlloc = Object.values(allocation).reduce((s: number, v: any) => s + v, 0) as number;

  return (
    <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Coins size={14} className="text-gold" />
        Finance Snapshot
      </h2>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold text-white tabular-nums">
          ₪{(finance?.totalNIS || 0).toLocaleString()}
        </span>
        <span
          className={`text-sm font-medium flex items-center gap-0.5 ${
            (finance?.changePercent || 0) >= 0 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {(finance?.changePercent || 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {(finance?.changePercent || 0) >= 0 ? "+" : ""}
          {finance?.changePercent || 0}%
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-4 tabular-nums">
        {(finance?.changeTodayNIS || 0) >= 0 ? "+" : ""}₪{(finance?.changeTodayNIS || 0).toLocaleString()} today
      </p>

      {/* 7-day sparkline chart */}
      <div className="h-28 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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

      {/* Stacked allocation bar */}
      <div className="mb-3">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Allocation</div>
        <div className="h-3 rounded-full overflow-hidden flex">
          {Object.entries(allocation).map(([key, val]) => (
            <div
              key={key}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
              style={{
                width: `${((val as number) / totalAlloc) * 100}%`,
                backgroundColor: ALLOC_COLORS[key] || "#64748b",
              }}
            />
          ))}
        </div>
        <div className="flex gap-3 mt-1.5 flex-wrap">
          {Object.entries(allocation).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5 text-[10px]">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ALLOC_COLORS[key] || "#64748b" }} />
              <span className="text-slate-400 capitalize">{key}</span>
              <span className="text-slate-300 font-medium tabular-nums">{val as number}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top 3 holdings */}
      <div className="border-t border-slate-700/50 pt-3">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Top Holdings</div>
        <div className="space-y-2">
          {(finance?.holdings || []).slice(0, 3).map((h: any) => (
            <div key={h.name} className="flex items-center justify-between text-xs">
              <span className="text-slate-300 truncate mr-2">{h.name}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-slate-400 tabular-nums">₪{h.value?.toLocaleString()}</span>
                <span className={`tabular-nums font-medium ${h.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {h.changePercent >= 0 ? "+" : ""}{h.changePercent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
