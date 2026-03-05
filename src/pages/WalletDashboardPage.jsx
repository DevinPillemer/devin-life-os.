import { format } from 'date-fns'
import { TrendingUp, Zap, BookOpen, Heart, Target, Wallet, DollarSign } from 'lucide-react'
import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { INCENTIVE_CONFIG } from '@/data/seedData'
import { useLocalStorage } from '@/hooks/useLocalStorage'

function getCurrentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getCurrentMonthLabel() {
  return format(new Date(), 'MMMM yyyy')
}

function SectionCard({ icon: Icon, name, earned, config, color, bgColor }) {
  const pct = config.max > 0 ? Math.min((earned / config.max) * 100, 100) : 0
  const isMaxed = earned >= config.max

  return (
    <Card className={`border border-slate-800 bg-slate-900/60 p-5 space-y-3 ${isMaxed ? 'border-teal-500/40' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <Icon size={16} className={color} />
          </div>
          <span className="font-semibold text-white text-sm">{name}</span>
        </div>
        {isMaxed && (
          <span className="text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full px-2 py-0.5">
            Maxed
          </span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-2xl font-bold ${color}`}>₪{earned}</p>
          <p className="text-xs text-slate-500">of ₪{config.base} base + ₪{config.accelerator} accelerator</p>
        </div>
        <p className="text-sm text-slate-400">₪{config.max} max</p>
      </div>
      <div>
        <Progress value={pct} className="h-2 bg-slate-800" />
        <p className="text-xs text-slate-500 mt-1">{Math.round(pct)}% of max</p>
      </div>
    </Card>
  )
}

export default function WalletDashboardPage() {
  const { sections, totalBaseBudget, totalMaxBudget } = INCENTIVE_CONFIG
  const monthKey = getCurrentMonthKey()
  const monthLabel = getCurrentMonthLabel()

  // Monthly wallet data - resets each month
  const [monthlyData] = useLocalStorage(`wallet-${monthKey}`, null)
  const [stravaData] = useLocalStorage('strava-health-data', null)
  const [habitifyData] = useLocalStorage('habitify-sync-data', null)
  const [notionGoals] = useLocalStorage('notion-goals-data', null)

  const sectionValues = useMemo(() => {
    // Learning: from stored monthly data or calculate from synced data
    const learning = monthlyData?.learning ?? Math.min(sections.learning.max, sections.learning.base * 0.8)

    // Daily Habits: based on habitify sync data for this month
    let dailyHabits = 0
    if (habitifyData?.journal?.length) {
      const completed = habitifyData.journal.filter(e => e?.status === 'completed').length
      const total = habitifyData.journal.length
      const ratio = total > 0 ? completed / total : 0
      dailyHabits = Math.min(sections.dailyHabits.max, Math.round(ratio * sections.dailyHabits.max))
    } else {
      dailyHabits = monthlyData?.dailyHabits ?? 0
    }

    // Health: from Strava sync - current month sessions
    let health = 0
    if (Array.isArray(stravaData) && stravaData.length) {
      const currentWeekData = stravaData.slice(0, 4) // last 4 weeks = approx current month
      const totalSessions = currentWeekData.reduce((sum, w) => sum + (w.totalSessions || 0), 0)
      health = Math.min(sections.health.max, totalSessions * INCENTIVE_CONFIG.healthRate)
    } else {
      health = monthlyData?.health ?? 0
    }

    // Goals: from Notion sync - count in-progress goals (credit for working on them)
    let goals = 0
    if (Array.isArray(notionGoals)) {
      const inProgressCount = notionGoals.filter(g => g.status === 'in_progress').length
      const doneCount = notionGoals.filter(g => g.status === 'done').length
      goals = Math.min(sections.goals.max, doneCount * INCENTIVE_CONFIG.goalsRate)
    } else {
      goals = monthlyData?.goals ?? 0
    }

    // Finance: from monthly data
    const finance = monthlyData?.finance ?? 0

    return { learning, dailyHabits, health, goals, finance }
  }, [monthlyData, stravaData, habitifyData, notionGoals, sections])

  const total = Object.values(sectionValues).reduce((sum, v) => sum + v, 0)
  const pctOfBase = totalBaseBudget > 0 ? Math.min((total / totalBaseBudget) * 100, 100) : 0
  const pctOfMax = totalMaxBudget > 0 ? Math.min((total / totalMaxBudget) * 100, 100) : 0

  const sectionConfig = [
    { key: 'learning', name: 'Learning', icon: BookOpen, color: 'text-blue-400', bgColor: 'bg-blue-500/10', config: sections.learning },
    { key: 'dailyHabits', name: 'Habits', icon: Zap, color: 'text-orange-400', bgColor: 'bg-orange-500/10', config: sections.dailyHabits },
    { key: 'health', name: 'Health', icon: Heart, color: 'text-rose-400', bgColor: 'bg-rose-500/10', config: sections.health },
    { key: 'goals', name: 'Goals', icon: Target, color: 'text-purple-400', bgColor: 'bg-purple-500/10', config: sections.goals },
    { key: 'finance', name: 'Finance', icon: DollarSign, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', config: sections.finance },
  ]

  return (
    <div className="space-y-6 rounded-xl bg-slate-950 p-4 text-white">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={22} className="text-teal-400" />
            <h2 className="text-2xl font-bold">Your Wallet</h2>
          </div>
          <p className="text-sm text-slate-400">{monthLabel} &bull; Resets each month</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-teal-400">₪{total}</p>
          <p className="text-xs text-slate-500">earned this month</p>
        </div>
      </div>

      {/* Total Progress */}
      <Card className="border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-teal-400" />
            <span className="font-semibold text-sm">Monthly Total</span>
          </div>
          <span className="text-sm text-slate-400">₪{totalBaseBudget} base / ₪{totalMaxBudget} max</span>
        </div>
        <Progress value={pctOfMax} className="h-3 bg-slate-800" />
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>₪0</span>
          <span className="text-teal-400 font-medium">₪{total} earned ({Math.round(pctOfMax)}% of max)</span>
          <span>₪{totalMaxBudget}</span>
        </div>
        <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all"
            style={{ width: `${pctOfBase}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">{Math.round(pctOfBase)}% of base budget (₪{totalBaseBudget})</p>
      </Card>

      {/* Section Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sectionConfig.map(({ key, name, icon, color, bgColor, config }) => (
          <SectionCard
            key={key}
            icon={icon}
            name={name}
            earned={sectionValues[key]}
            config={config}
            color={color}
            bgColor={bgColor}
          />
        ))}
      </div>

      <p className="text-xs text-slate-600 text-center">
        Wallet accumulates from synced data and resets at the start of each month.
        Sync Health, Habits, and Goals to update your earned amounts.
      </p>
    </div>
  )
}
