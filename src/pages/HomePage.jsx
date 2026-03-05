import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, BookOpen, CheckCircle2, Dumbbell, Flame, Goal, Heart, Sparkles, Target, TrendingUp, Wallet, Waves, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { COURSES, GOALS, HEALTH_DATA, INCENTIVE_CONFIG, HABIT_CATEGORY_MAP } from '@/data/seedData'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const GREETINGS = [
  'Good morning', 'Keep building', 'Stay focused', 'Push forward', 'Own the day'
]

const formatCurrency = (v) => '\u20AA' + (v || 0).toLocaleString()

function getCurrentWeekId() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const dayOfYear = Math.floor((now - startOfYear) / 86400000)
  const weekNum = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

function normalizeSeedHealth(rows) {
  return rows.map(row => ({
    weekId: row.weekId,
    swims: Number(row?.swims || 0),
    weightTraining: Number(row?.hiit || 0),
    totalSessions: Number(row?.swims || 0) + Number(row?.hiit || 0),
    incentiveValue: Number(row?.incentiveValue || 0)
  }))
}

export default function HomePage() {
  // Read from same localStorage keys as individual pages
  const [habitsData] = useLocalStorage('habitify-habits-data', [])
  const [syncedHealthData] = useLocalStorage('strava-health-data', null)
  const [storedGoals] = useLocalStorage('notion-goals-data', null)
  const [greeting] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)])

  // Daily Habits: derive from localStorage (same as DailyHabitsPage)
  const habitStats = useMemo(() => {
    if (!habitsData || !habitsData.length) return null
    const normalize = s => (s || '').trim().toLowerCase()
    const completedNames = new Set(
      habitsData
        .filter(h => h.status === 'completed' || h.status === 'passed' || h.is_done === true)
        .map(h => normalize(h.name || h.habit_name || h.title))
        .filter(Boolean)
    )
    const entries = Object.entries(HABIT_CATEGORY_MAP)
    const apiNames = new Set(habitsData.map(h => normalize(h.name || h.habit_name || h.title)).filter(Boolean))
    const apiEntries = entries.filter(([habit]) => apiNames.has(habit.trim().toLowerCase()))
    const total = apiEntries.length > 0 ? apiEntries.length : entries.length
    const completed = entries.filter(([habit]) => completedNames.has(habit.trim().toLowerCase())).length
    const points = entries
      .filter(([habit]) => completedNames.has(habit.trim().toLowerCase()))
      .reduce((sum, [, meta]) => sum + meta.points, 0)
    const maxPoints = apiEntries.length > 0
      ? apiEntries.reduce((sum, [, meta]) => sum + meta.points, 0)
      : entries.reduce((sum, [, meta]) => sum + meta.points, 0)
    return { completed, total, points, maxPoints }
  }, [habitsData])

  // Health: read from localStorage or fall back to seed data
  const healthRows = useMemo(() => {
    if (Array.isArray(syncedHealthData) && syncedHealthData.length) return syncedHealthData
    return normalizeSeedHealth(HEALTH_DATA)
  }, [syncedHealthData])

  const currentWeekId = getCurrentWeekId()
  const currentWeek = healthRows.find(w => w.weekId === currentWeekId) || healthRows[0] || null
  const totalSessions = currentWeek ? (currentWeek.swims || 0) + (currentWeek.weightTraining || currentWeek.hiit || 0) : 0

  // Goals: read from localStorage or fall back to seed data
  const allGoals = useMemo(() => {
    if (Array.isArray(storedGoals) && storedGoals.length) return storedGoals
    return GOALS
  }, [storedGoals])

  const goalsStats = useMemo(() => {
    const active = allGoals.filter(g => g.status === 'in_progress' || g.status === 'todo')
    const done = allGoals.filter(g => g.status === 'done').length
    const total = allGoals.length
    return { count: active.length, done, total }
  }, [allGoals])

  // Learning (from seed data - no sync for courses)
  const learningStats = useMemo(() => {
    const completed = COURSES.filter(c => c.status === 'completed').length
    const inProgress = COURSES.filter(c => c.status === 'in_progress').length
    const total = COURSES.length
    const milestones = COURSES.reduce((s, c) => {
      if (c.status === 'completed') return s + c.modules.length
      if (c.status === 'in_progress') return s + Math.floor(c.modules.length / 2)
      return s
    }, 0)
    const totalMilestones = COURSES.reduce((s, c) => s + c.modules.length, 0)
    const earned = Math.min(INCENTIVE_CONFIG.sections.learning.base, milestones * 10)
    const accelerator = completed >= 7 ? INCENTIVE_CONFIG.sections.learning.accelerator : 0
    return { completed, inProgress, total, milestones, totalMilestones, earned, accelerator, sectionTotal: earned + accelerator }
  }, [])

  // Incentive calculations
  const healthIncentive = healthRows
    .filter(w => w.weekId.startsWith('2026'))
    .reduce((s, w) => s + (w.incentiveValue || 0), 0)
  const healthEarned = Math.min(
    INCENTIVE_CONFIG.sections.health.base + INCENTIVE_CONFIG.sections.health.accelerator,
    healthIncentive
  )

  const habitsEarned = habitStats
    ? Math.min(INCENTIVE_CONFIG.sections.dailyHabits.base,
        Math.round((habitStats.completed / (habitStats.total || 1)) * INCENTIVE_CONFIG.sections.dailyHabits.base))
    : 0

  const goalsEarned = Math.min(INCENTIVE_CONFIG.sections.goals.base, goalsStats.done * INCENTIVE_CONFIG.goalsRate)

  const totalWallet = learningStats.sectionTotal + habitsEarned + healthEarned + goalsEarned
  const walletMax = INCENTIVE_CONFIG.totalMaxBudget
  const habitPct = habitStats ? Math.round((habitStats.completed / (habitStats.total || 1)) * 100) : 0

  return (
    <div className="space-y-5 p-4 text-white">
      {/* Hero */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-yellow-500/20 text-yellow-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles size={12} /> Daily Overview
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">{greeting}, Devin.</h1>
            <p className="text-slate-400 text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Wallet this month</p>
            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(totalWallet)}</p>
            <p className="text-xs text-slate-500">of {formatCurrency(walletMax)} max</p>
          </div>
          <Link to="/wallet">
            <Button variant="outline" size="sm" className="gap-1.5 border-slate-600">
              <Wallet size={14} /> Wallet
            </Button>
          </Link>
        </div>
        {/* Wallet progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all" style={{ width: `${Math.min(100, Math.round((totalWallet / walletMax) * 100))}%` }} />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-slate-500">
            <span>{formatCurrency(0)}</span>
            <span>{Math.round((totalWallet / walletMax) * 100)}% of monthly max</span>
            <span>{formatCurrency(walletMax)}</span>
          </div>
        </div>
      </Card>

      {/* 4 Section Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Health */}
        <Link to="/health">
          <Card className="bg-slate-900/80 border-slate-800 p-4 hover:border-slate-600 transition-colors h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 text-sm font-semibold"><Heart size={14} className="text-rose-400" /> Health</span>
              <span className="text-emerald-400 text-sm font-bold">{formatCurrency(healthEarned)}</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between"><span><Waves size={12} className="inline mr-1" />Swims this week</span><span className="text-white font-medium">{currentWeek?.swims || 0}</span></div>
              <div className="flex justify-between"><span><Dumbbell size={12} className="inline mr-1" />Weight / HIIT</span><span className="text-white font-medium">{currentWeek?.weightTraining || currentWeek?.hiit || 0}</span></div>
              <div className="flex justify-between"><span><Activity size={12} className="inline mr-1" />Total sessions</span><span className="text-white font-medium">{totalSessions}</span></div>
            </div>
            <p className="text-[10px] text-slate-600 mt-2">Week {currentWeekId}</p>
          </Card>
        </Link>

        {/* Daily Habits */}
        <Link to="/dailyhabits">
          <Card className="bg-slate-900/80 border-slate-800 p-4 hover:border-slate-600 transition-colors h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 text-sm font-semibold"><Flame size={14} className="text-orange-400" /> Daily Habits</span>
              <span className="text-emerald-400 text-sm font-bold">{formatCurrency(habitsEarned)}</span>
            </div>
            {habitStats ? (
              <div>
                <p className="text-2xl font-bold text-orange-400">{habitStats.completed} <span className="text-sm text-slate-500 font-normal">/ {habitStats.total}</span></p>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${habitPct}%` }} />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{habitPct}% complete today</p>
              </div>
            ) : (
              <div>
                <p className="text-slate-500">—</p>
                <p className="text-[10px] text-slate-600 mt-1">Sync habits to load data</p>
              </div>
            )}
            <p className="text-[10px] text-slate-600 mt-2">Today's score</p>
          </Card>
        </Link>

        {/* Learning */}
        <Link to="/dashboard">
          <Card className="bg-slate-900/80 border-slate-800 p-4 hover:border-slate-600 transition-colors h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 text-sm font-semibold"><BookOpen size={14} className="text-blue-400" /> Learning</span>
              <span className="text-emerald-400 text-sm font-bold">{formatCurrency(learningStats.sectionTotal)}</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between"><span><CheckCircle2 size={12} className="inline mr-1" />Courses completed</span><span className="text-white font-medium">{learningStats.completed}/{learningStats.total}</span></div>
              <div className="flex justify-between"><span><TrendingUp size={12} className="inline mr-1" />In progress</span><span className="text-white font-medium">{learningStats.inProgress}</span></div>
              <div className="flex justify-between"><span><Zap size={12} className="inline mr-1" />Milestones done</span><span className="text-white font-medium">{learningStats.milestones}/{learningStats.totalMilestones}</span></div>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${Math.round((learningStats.milestones / learningStats.totalMilestones) * 100)}%` }} />
            </div>
          </Card>
        </Link>

        {/* Goals */}
        <Link to="/goalstracker">
          <Card className="bg-slate-900/80 border-slate-800 p-4 hover:border-slate-600 transition-colors h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 text-sm font-semibold"><Target size={14} className="text-violet-400" /> Goals</span>
              <span className="text-emerald-400 text-sm font-bold">{formatCurrency(goalsEarned)}</span>
            </div>
            <p className="text-2xl font-bold text-violet-400">{goalsStats.count} <span className="text-sm text-slate-500 font-normal">active</span></p>
            <div className="space-y-1.5 text-xs text-slate-400 mt-2">
              <div className="flex justify-between"><span><CheckCircle2 size={12} className="inline mr-1" />Completed goals</span><span className="text-white font-medium">{goalsStats.done}</span></div>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full" style={{ width: `${goalsStats.total > 0 ? Math.round((goalsStats.done / goalsStats.total) * 100) : 0}%` }} />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">{goalsStats.total > 0 ? Math.round((goalsStats.done / goalsStats.total) * 100) : 0}% of all goals done</p>
          </Card>
        </Link>
      </div>

      {/* Quick nav bottom row */}
      <div className="grid grid-cols-3 gap-3">
        <Link to="/wallet">
          <Card className="bg-slate-900/60 border-slate-800 p-3 hover:border-slate-600 transition-colors text-center">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-emerald-400" />
              <div className="text-left">
                <p className="text-xs font-semibold">Wallet</p>
                <p className="text-[10px] text-slate-500">Monthly earnings tracker</p>
              </div>
              <span className="ml-auto text-emerald-400 font-bold text-sm">{formatCurrency(totalWallet)}</span>
              <span className="text-[10px] text-slate-500">this month</span>
            </div>
          </Card>
        </Link>
        <Link to="/health">
          <Card className="bg-slate-900/60 border-slate-800 p-3 hover:border-slate-600 transition-colors text-center">
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-rose-400" />
              <div className="text-left">
                <p className="text-xs font-semibold">Health</p>
                <p className="text-[10px] text-slate-500">Workout tracking & Strava</p>
              </div>
              <span className="ml-auto text-white font-bold text-sm">{totalSessions}</span>
              <span className="text-[10px] text-slate-500">sessions this week</span>
            </div>
          </Card>
        </Link>
        <Link to="/goalstracker">
          <Card className="bg-slate-900/60 border-slate-800 p-3 hover:border-slate-600 transition-colors text-center">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-violet-400" />
              <div className="text-left">
                <p className="text-xs font-semibold">Goals</p>
                <p className="text-[10px] text-slate-500">In-progress goal tracker</p>
              </div>
              <span className="ml-auto text-white font-bold text-sm">{goalsStats.count}</span>
              <span className="text-[10px] text-slate-500">active goals</span>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
