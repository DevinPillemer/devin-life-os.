"use client";

import { useEffect, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import {
  Wallet,
  CheckCircle2,
  Activity,
  Target,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Coins,
} from "lucide-react";

// ── Animated counter ──
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;
      setValue(Math.round(current * 10) / 10);
      ref.current = current;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

// ── Sparkline ──
function Sparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${id})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Skeleton loader ──
function KpiSkeleton({ large }: { large?: boolean }) {
  return (
    <div className={`rounded-xl bg-surface border border-slate-700/50 dark:border-slate-700/50 light:border-slate-200 p-4 ${large ? "col-span-1" : ""}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-14 h-3 skeleton rounded" />
      </div>
      <div className="w-24 h-7 skeleton rounded mb-1" />
      <div className="w-16 h-3 skeleton rounded" />
    </div>
  );
}

// ── Delta badge ──
function Delta({ value, suffix = "" }: { value: number; suffix?: string }) {
  if (value === 0) return null;
  const up = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${up ? "text-emerald-400" : "text-red-400"}`}>
      {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {up ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}

// ── Types ──
interface KpiCardsProps {
  wallet: any;
  walletLoading: boolean;
  finance: any;
  financeLoading: boolean;
  habits: any;
  habitsLoading: boolean;
  health: any;
  healthLoading: boolean;
  goals: any;
  goalsLoading: boolean;
  learning: any;
  learningLoading: boolean;
  completedHabits: number;
  totalHabits: number;
}

export default function KpiCards({
  wallet,
  walletLoading,
  finance,
  financeLoading,
  habits,
  habitsLoading,
  health,
  healthLoading,
  goals,
  goalsLoading,
  learning,
  learningLoading,
  completedHabits,
  totalHabits,
}: KpiCardsProps) {
  const walletSpent = useCountUp(wallet?.spent || 0);
  const portfolioVal = useCountUp(finance?.totalNIS || 0);
  const habitPct = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
  const habitPctAnim = useCountUp(habitPct);
  const sessionsAnim = useCountUp(health?.sessions || 0);
  const goalsAnim = useCountUp(goals?.active || 0);
  const streakAnim = useCountUp(learning?.streakDays || 0);

  const learningReward = wallet?.rewards?.learning ?? wallet?.breakdown?.find((item: any) => String(item.category || "").toLowerCase() === "learning")?.spent ?? 160;
  const learningRewardAnim = useCountUp(learningReward);

  const walletPct = wallet ? Math.round((wallet.spent / wallet.limit) * 100) : 0;

  if (walletLoading && financeLoading && habitsLoading && healthLoading && goalsLoading && learningLoading) {
    return (
      <section className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <KpiSkeleton large />
          <KpiSkeleton large />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6">
      {/* Primary row: Wallet + Finance (larger) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {/* Wallet */}
        <div className="rounded-xl bg-surface border border-slate-700/50 p-5 hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <Wallet size={14} />
              Wallet
            </div>
            <Sparkline data={wallet?.weeklySpending || [0]} color="#14b8a6" id="wallet" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tabular-nums">
              ₪{Math.round(walletSpent).toLocaleString()}
            </span>
            <span className="text-sm text-slate-400">/ ₪{wallet?.limit?.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Delta value={wallet ? wallet.spent - (wallet.yesterdaySpent || wallet.spent) : 0} suffix=" NIS" />
            <span className="text-xs text-slate-500">vs yesterday</span>
          </div>
          <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(walletPct, 100)}%`,
                background: walletPct > 90 ? "linear-gradient(90deg, #ef4444, #dc2626)" : "linear-gradient(90deg, #14b8a6, #14b8a6cc)",
              }}
            />
          </div>
        </div>

        {/* Finance */}
        <div className="rounded-xl bg-surface border border-slate-700/50 p-5 hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <Coins size={14} />
              Finance
            </div>
            <Sparkline data={finance?.weekTrend || [0]} color="#f59e0b" id="finance" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tabular-nums">
              ₪{Math.round(portfolioVal).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Delta value={finance?.changePercent || 0} suffix="%" />
            <span className="text-xs text-slate-500">
              {finance?.changeTodayNIS ? `₪${finance.changeTodayNIS.toLocaleString()} today` : ""}
            </span>
          </div>
          {/* Top holdings mini */}
          <div className="mt-3 space-y-1">
            {(finance?.holdings || []).slice(0, 3).map((h: any) => (
              <div key={h.name} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate">{h.name}</span>
                <span className={h.changePercent >= 0 ? "text-emerald-400 tabular-nums" : "text-red-400 tabular-nums"}>
                  {h.changePercent >= 0 ? "+" : ""}{h.changePercent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary row: compact badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Habits */}
        <div className="rounded-xl bg-surface border border-slate-700/50 p-3 hover:border-slate-600 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold text-white tabular-nums leading-tight">
                {Math.round(habitPctAnim)}%
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Habits</div>
            </div>
            <Delta value={completedHabits - (habits?.completed || completedHabits)} />
          </div>
        </div>

        {/* Health */}
        <div className="rounded-xl bg-surface border border-slate-700/50 p-3 hover:border-slate-600 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Activity size={16} className="text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold text-white tabular-nums leading-tight">
                {Math.round(sessionsAnim)}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Sessions</div>
            </div>
            <Delta value={health?.vsLastWeek?.sessionsDelta || 0} />
          </div>
        </div>

        {/* Goals */}
        <div className="rounded-xl bg-surface border border-slate-700/50 p-3 hover:border-slate-600 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <Target size={16} className="text-violet-400" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold text-white tabular-nums leading-tight">
                {Math.round(goalsAnim)}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Goals</div>
            </div>
          </div>
        </div>

        {/* Learning */}
        <div className="rounded-xl bg-surface border border-slate-700/50 p-3 hover:border-slate-600 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center flex-shrink-0">
              <BookOpen size={16} className="text-pink-400" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold text-white tabular-nums leading-tight">
                ₪{Math.round(learningRewardAnim)}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Learning</div>
              <div className="text-[9px] text-slate-500">{Math.round(streakAnim)} day streak</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
