import { useState, useEffect } from 'react'
import { Wallet, CheckSquare, Activity, Target, BookOpen, RefreshCw, ExternalLink, Droplets, Dumbbell, Loader2 } from 'lucide-react'
import { useApp } from '../context/AppContext'

// ── Animated counter ──
function Counter({ end, prefix = '', suffix = '' }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const animate = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 1200, 1)
      setVal(Math.floor(end * (1 - Math.pow(1 - p, 3))))
      if (p < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [end])
  return <span className="tabular-nums">{prefix}{val.toLocaleString()}{suffix}</span>
}

// ── Progress bar ──
function ProgressBar({ pct, color }) {
  const [w, setW] = useState(0)
  useEffect(() => { setTimeout(() => setW(pct), 200) }, [pct])
  return (
    <div className="h-1 bg-surface-3 rounded-full overflow-hidden mt-3">
      <div className="h-full rounded-full transition-all duration-[800ms]" style={{ width: `${w}%`, background: `var(--${color}, #4f98a3)` }} />
    </div>
  )
}

// ── KPI Card ──
function KpiCard({ icon: Icon, iconBg, iconColor, label, value, prefix, suffix, sub, barPct, barColor, period, badge, badgeColor, reward }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 relative overflow-hidden hover:border-border-hi transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={15} style={{ color: iconColor }} />
        </div>
        {period && <span className="text-[10px] text-text-faint">{period}</span>}
        {badge && <span className={`text-[10px] font-semibold ${badgeColor || 'text-green'}`}>{badge}</span>}
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.07em] text-text-muted">{label}</div>
      <div className="text-2xl font-bold mt-0.5 animate-count-up" style={{ color: iconColor }}>
        {typeof value === 'number' ? <Counter end={value} prefix={prefix} suffix={suffix} /> : <span>{value}</span>}
      </div>
      <div className="text-[11px] text-text-muted mt-0.5">{sub}</div>
      {barPct !== undefined && <ProgressBar pct={barPct} color={barColor} />}
      {reward && <div className="text-[11px] text-gold font-semibold mt-1">{reward}</div>}
    </div>
  )
}

// ── Habit Ring ──
function HabitRing({ pct, color }) {
  const r = 32, circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg width={80} height={80} className="-rotate-90">
        <circle cx={40} cy={40} r={r} fill="none" stroke="var(--surface-3, #211f1c)" strokeWidth={7} />
        <circle cx={40} cy={40} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={circ} strokeDashoffset={circ}
          className="ring-animated" strokeLinecap="round"
          style={{ '--circumference': circ, '--offset': offset }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{pct}</span>
        <span className="text-[9px] text-text-muted">%</span>
      </div>
    </div>
  )
}

// ── Habit Row ──
function HabitRow({ habit }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-1.5 rounded-sm border transition-all ${
      habit.done ? 'bg-surface-2 border-green/20' : 'bg-surface-2 border-transparent opacity-50'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
        habit.done ? 'bg-green shadow-[0_0_6px_var(--green)]' : 'bg-text-faint'
      }`} />
      <span className="text-xs flex-1">{habit.name}</span>
      <span className="text-[10px] text-text-muted font-semibold">{habit.pts} pts</span>
    </div>
  )
}

// ── Habit Category ──
function HabitCategory({ cat }) {
  const total = cat.habits.length
  const done = cat.habits.filter(h => h.done).length
  const pct = Math.round((done / total) * 100)
  const colorVar = `var(--${cat.color}, #4f98a3)`

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: colorVar }}>{cat.name}</span>
        <span className="text-[10px] text-text-muted">{done}/{total} · {pct}%</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {cat.habits.map(h => <HabitRow key={h.id} habit={h} />)}
      </div>
    </div>
  )
}

// ── Health Week Row ──
function WeekRow({ week }) {
  return (
    <div className={`grid grid-cols-[70px_1fr_1fr_50px] items-center gap-3 px-4 py-3 rounded-sm border ${
      week.highlight ? 'bg-accent/5 border-accent/20' : 'bg-surface-2 border-border'
    }`}>
      <span className={`text-[11px] font-semibold ${week.highlight ? 'text-accent' : 'text-text-muted'}`}>{week.label}</span>
      <div className="flex items-center gap-2 text-xs">
        <Droplets size={12} className="text-text-faint" />
        {week.swims} swims
      </div>
      <div className="flex items-center gap-2 text-xs">
        <Dumbbell size={12} className="text-text-faint" />
        {week.weights} weights
      </div>
      <span className="text-xs text-gold font-bold text-right">₪{week.earned}</span>
    </div>
  )
}

// ── Wallet Breakdown Item ──
function WalletItem({ item }) {
  const maxPct = item.maxAmount > 0 ? Math.round((item.amount / item.maxAmount) * 100) : 0
  const colorVar = `var(--${item.color}, #4f98a3)`
  const icons = { check: CheckSquare, activity: Activity, target: Target, book: BookOpen }
  const Icon = icons[item.icon] || CheckSquare

  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0"
        style={{ background: `var(--${item.color}-dim, rgba(79,152,163,0.15))` }}>
        <Icon size={13} style={{ color: colorVar }} />
      </div>
      <span className="text-xs flex-1">{item.module}</span>
      <div className="flex-1 h-[3px] bg-surface-3 rounded-full overflow-hidden">
        <div className="h-full rounded-full progress-bar-animate" style={{ width: `${maxPct}%`, background: colorVar }} />
      </div>
      <span className="text-xs font-semibold" style={{ color: item.amount > 0 ? colorVar : 'var(--text-faint)' }}>
        ₪{item.amount}
      </span>
    </div>
  )
}

// ── Goal Item ──
function GoalItem({ goal }) {
  const dotColors = { high: 'bg-red', medium: 'bg-gold', low: 'bg-text-faint' }
  return (
    <div className="flex items-start gap-3 p-3 bg-surface-2 rounded-sm border border-border hover:border-border-hi transition-all mb-1.5">
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[5px] ${dotColors[goal.priority] || 'bg-text-faint'}`} />
      <div>
        <div className="text-xs leading-relaxed">{goal.text}</div>
        <div className="flex gap-2 items-center mt-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-3 text-text-muted">{goal.tag}</span>
          <span className="text-[10px] text-text-faint">{goal.date}</span>
        </div>
      </div>
    </div>
  )
}

// ── Goal Group Card ──
function GoalGroupCard({ group }) {
  const colorVar = `var(--${group.color}, #4f98a3)`
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colorVar }} />
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted">{group.name}</span>
        <span className="text-[10px] bg-surface-3 px-1.5 py-0.5 rounded-full text-text-faint">
          {group.active} active{group.done > 0 && ` · ${group.done} done`}
        </span>
      </div>
      {group.goals.map(g => <GoalItem key={g.id} goal={g} />)}
    </div>
  )
}

// ── MAIN DASHBOARD ──
export default function DashboardPage() {
  const { habitCategories, healthWeeks, walletEarnings, goalGroups, strava, fetchStrava } = useApp()

  const allHabits = habitCategories.flatMap(c => c.habits)
  const totalPts = allHabits.reduce((s, h) => s + h.pts, 0)
  const donePts = allHabits.filter(h => h.done).reduce((s, h) => s + h.pts, 0)
  const habitPct = Math.round((allHabits.filter(h => h.done).length / allHabits.length) * 100)

  const today = new Date()
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const weekNum = Math.ceil(((today - new Date(today.getFullYear(), 0, 1)) / 86400000 + new Date(today.getFullYear(), 0, 1).getDay() + 1) / 7)

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent mb-2">Good evening, Devin</div>
          <h1 className="font-serif text-3xl md:text-4xl text-text font-normal italic leading-tight">Your Daily Command Center</h1>
          <p className="text-[13px] text-text-muted mt-2">{dateStr} · Week {weekNum}{strava.lastSynced ? ` · Last synced ${strava.lastSynced}` : ''}</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-medium border border-border bg-surface-2 text-text-muted hover:bg-surface-3 hover:text-text transition-all">
            <RefreshCw size={13} /> Sync All
          </button>
          <a href="https://feedly-news-dashboard.vercel.app" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-medium bg-accent text-white border border-transparent hover:bg-accent/90 transition-all">
            <ExternalLink size={13} /> Open Floopify
          </a>
        </div>
      </div>

      {/* ── ROW 1: KPI Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard icon={Wallet} iconBg="var(--gold-dim)" iconColor="var(--gold)" label="Wallet" value={walletEarnings.total} prefix="₪" sub={`of ₪${walletEarnings.monthlyMax.toLocaleString()} max`} barPct={Math.round(walletEarnings.total / walletEarnings.monthlyMax * 100)} barColor="gold" period="April" />
        <KpiCard icon={CheckSquare} iconBg="var(--green-dim)" iconColor="var(--green)" label="Daily Habits" value={habitPct} suffix="%" sub={`${allHabits.filter(h => h.done).length}/${allHabits.length} complete today`} barPct={habitPct} barColor="green" badge={habitPct === 100 ? 'Perfect ✓' : null} badgeColor="text-green" reward="₪240 monthly reward" />
        <KpiCard icon={Activity} iconBg="var(--accent-dim)" iconColor="var(--accent)" label="Health" value={strava.thisWeek.total} sub={`session${strava.thisWeek.total !== 1 ? 's' : ''} this week`} barPct={Math.min(100, Math.round(strava.thisWeek.total / 7 * 100))} barColor="accent" period={`Apr W${weekNum}`} reward={`₪${strava.thisMonth.earned} earned this month`} />
        <KpiCard icon={Target} iconBg="var(--purple-dim)" iconColor="var(--purple)" label="Goals" value={23} sub="active · 13 done" barPct={36} barColor="purple" period="Notion" />
        <KpiCard icon={BookOpen} iconBg="var(--orange-dim)" iconColor="var(--orange)" label="Learning" value="—" sub="Sync to load data" barPct={0} barColor="orange" period="Monthly" reward="₪0 this month" />
      </div>

      {/* ── ROW 2: Habits + Health/Wallet ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Habits Breakdown */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[13px] font-semibold">Today&apos;s Habits</div>
              <div className="text-[11px] text-text-muted mt-0.5">
                {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {donePts}/{totalPts} pts
              </div>
            </div>
            <HabitRing pct={habitPct} color="var(--green)" />
          </div>
          <div className="space-y-4">
            {habitCategories.map(cat => <HabitCategory key={cat.name} cat={cat} />)}
          </div>
        </div>

        {/* Health + Wallet stacked */}
        <div className="flex flex-col gap-4">

          {/* Health / Strava */}
          <div className="bg-surface border border-border rounded-lg p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[13px] font-semibold">Health / Strava</div>
                <div className="text-[11px] text-text-muted mt-0.5">
                  ₪5/session · {today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  {strava.lastSynced && <span> · Synced {strava.lastSynced}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {strava.loading && <Loader2 size={14} className="animate-spin text-accent" />}
                <button onClick={fetchStrava} disabled={strava.loading} className="text-[10px] font-medium text-accent hover:text-accent/80 transition-colors disabled:opacity-50">
                  <RefreshCw size={12} />
                </button>
                {strava.error ? (
                  <span className="text-[10px] font-semibold text-red bg-red-dim px-2 py-1 rounded-full" title={strava.error}>API error</span>
                ) : strava.thisMonth.total === 0 && !strava.loading ? (
                  <span className="text-[10px] font-semibold text-red bg-red-dim px-2 py-1 rounded-full">No activity yet</span>
                ) : strava.thisMonth.total > 0 ? (
                  <span className="text-[10px] font-semibold text-green bg-green-dim px-2 py-1 rounded-full">{strava.thisMonth.total} this month</span>
                ) : null}
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="text-xl font-bold text-accent">{strava.thisMonth.swims}</div>
                <div className="text-[10px] text-text-muted uppercase tracking-[0.06em]">Swims</div>
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-orange">{strava.thisMonth.weights}</div>
                <div className="text-[10px] text-text-muted uppercase tracking-[0.06em]">Weights</div>
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-gold">₪{strava.thisMonth.earned}</div>
                <div className="text-[10px] text-text-muted uppercase tracking-[0.06em]">Earned</div>
              </div>
            </div>

            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-faint mb-3">Recent Weeks</div>
            <div className="flex flex-col gap-2">
              {strava.weeklyHistory.length > 0
                ? strava.weeklyHistory.map(w => <WeekRow key={w.label} week={w} />)
                : healthWeeks.map(w => <WeekRow key={w.label} week={w} />)
              }
            </div>
          </div>

          {/* Wallet Earnings */}
          <div className="bg-surface border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-semibold">Monthly Earnings</div>
              <div className="text-lg font-bold text-gold">₪{walletEarnings.total}</div>
            </div>
            <div className="flex flex-col gap-3">
              {walletEarnings.breakdown.map(item => <WalletItem key={item.module} item={item} />)}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
              <span className="text-[11px] text-text-muted">Monthly max</span>
              <span className="text-xl font-bold text-gold">₪{walletEarnings.monthlyMax.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Goals ── */}
      <div className="flex items-center gap-4 mt-6 mb-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-faint">Active Goals</span>
        <span className="text-[11px] font-bold text-accent">23</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Col 1: Family Life */}
        <GoalGroupCard group={goalGroups[0]} />

        {/* Col 2: Individual + Finance */}
        <div className="flex flex-col gap-4">
          <GoalGroupCard group={goalGroups[1]} />
          <GoalGroupCard group={goalGroups[2]} />
        </div>

        {/* Col 3: Career + Social */}
        <div className="flex flex-col gap-4">
          <GoalGroupCard group={goalGroups[3]} />
          <GoalGroupCard group={goalGroups[4]} />
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-6 border-t border-border mt-4">
        <span className="text-[11px] text-text-faint">Floopify Life OS · Data from Habitify, Strava, Notion, Google Sheets</span>
        <span className="text-[11px] text-text-faint">Last synced: {strava.lastSynced || 'Not yet'}</span>
      </div>
    </div>
  )
}
