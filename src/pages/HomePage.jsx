import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, BookOpen, CheckCircle2, Dumbbell, Flame, Goal, Heart, Sparkles, Target, TrendingUp, Wallet, Waves, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { COURSES, GOALS, HEALTH_DATA, INCENTIVE_CONFIG, HABIT_CATEGORY_MAP } from '@/data/seedData'

const HABITIFY_API_KEY = import.meta.env.VITE_HABITIFY_API_KEY

const GREETINGS = [
  'Good morning', 'Keep building', 'Stay focused', 'Push forward', 'Own the day'
]

const formatCurrency = (v) => '₪' + (v || 0).toLocaleString()

function getCurrentWeekId() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const dayOfYear = Math.floor((now - startOfYear) / 86400000)
  const weekNum = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

export default function HomePage() {
  const [habitData, setHabitData] = useState(null)
  const [loadingHabits, setLoadingHabits] = useState(true)
  const [greeting] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)])

  useEffect(() => {
    async function fetchHabits() {
      setLoadingHabits(true)
      try {
        const today = new Date().toISOString().split('T')[0]
        const res = await fetch(`https://api.habitify.me/habits?target_date=${today}T00:00:00`, {
          headers: { Authorization: HABITIFY_API_KEY }
        })
        if (!res.ok) throw new Error('API error')
        const json = await res.json()
        const habits = json.data || []
        const completed = habits.filter(h => h.status === 'completed').length
        const total = habits.length
        const points = habits
          .filter(h => h.status === 'completed')
          .reduce((sum, h) => sum + (HABIT_CATEGORY_MAP[h.name]?.points || 10), 0)
        const maxPoints = habits.reduce((sum, h) => sum + (HABIT_CATEGORY_MAP[h.name]?.points || 10), 0)
        setHabitData({ completed, total, points, maxPoints })
      } catch {
        setHabitData(null)
      } finally {
        setLoadingHabits(false)
      }
    }
    fetchHabits()
  }, [])

  const currentWeekId = getCurrentWeekId()
  const currentWeek = HEALTH_DATA.find(w => w.weekId === currentWeekId) || HEALTH_DATA[HEALTH_DATA.length - 1]
  const totalSessions = (currentWeek?.swims || 0) + (currentWeek?.hiit || 0)

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

  const goalsStats = useMemo(() => {
    const inProgress = GOALS.filter(g => g.status === 'in_progress')
    const done = GOALS.filter(g => g.status === 'done').length
    const total = GOALS.length
    return { count: inProgress.length, done, total }
  }, [])

  const healthIncentive = HEALTH_DATA
    .filter(w => w.weekId.startsWith('2026'))
    .slice(0, Math.ceil(new Date().getMonth() + 1))
    .reduce((s, w) => s + (w.incentiveValue || 0), 0)
  const healthEarned = Math.min(INCENTIVE_CONFIG.sections.health.base + INCENTIVE_CONFIG.sections.health.accelerator, healthIncentive)

  const habitsEarned = habitData ? Math.min(INCENTIVE_CONFIG.sections.dailyHabits.base, Math.round((habitData.completed / (habitData.total || 1)) * INCENTIVE_CONFIG.sections.dailyHabits.base)) : 0
  const goalsEarned = Math.min(INCENTIVE_CONFIG.sections.goals.base, goalsStats.done * INCENTIVE_CONFIG.goalsRate)
  const totalWallet = learningStats.sectionTotal + habitsEarned + healthEarned + goalsEarned
  const walletMax = INCENTIVE_CONFIG.totalMaxBudget

  const habitPct = habitData ? Math.round((habitData.completed / (habitData.total || 1)) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/50 p-6 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3 w-3" />
              Daily Overview
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">{greeting}, Devin.</h1>
            <p className="text-slate-400 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Wallet this month</p>
              <p className="text-3xl font-extrabold text-yellow-300">{formatCurrency(totalWallet)}</p>
              <p className="text-xs text-slate-400">of {formatCurrency(walletMax)} max</p>
            </div>
            <Link to="/walletdashboard">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 hover:bg-slate-800">
                <Wallet className="h-4 w-4 mr-1" /> Wallet
              </Button>
            </Link>
          </div>
        </div>

        {/* Wallet progress bar */}
        <div className="mt-5">
          <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-emerald-400 transition-all"
              style={{ width: `${Math.min(100, (totalWallet / walletMax) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-slate-500">
            <span>{formatCurrency(0)}</span>
            <span>{Math.round((totalWallet / walletMax) * 100)}% of monthly max</span>
            <span>{formatCurrency(walletMax)}</span>
          </div>
        </div>
      </Card>

      {/* 4 Section Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Health */}
        <Link to="/health" className="block group">
          <Card className="border-slate-800 bg-slate-900/80 p-4 h-full hover:border-cyan-500/40 hover:bg-slate-900 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10">
                  <Heart className="h-4 w-4 text-cyan-400" />
                </div>
                <span className="font-semibold text-slate-200">Health</span>
              </div>
              <span className="text-xs font-bold text-yellow-300">{formatCurrency(healthEarned)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Waves className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs text-slate-400">Swims this week</span>
                <span className="ml-auto text-sm font-bold text-cyan-300">{currentWeek?.swims || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-xs text-slate-400">Weight / HIIT</span>
                <span className="ml-auto text-sm font-bold text-violet-300">{currentWeek?.hiit || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs text-slate-400">Total sessions</span>
                <span className="ml-auto text-sm font-bold text-emerald-300">{totalSessions}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800">
              <p className="text-xs text-slate-500">Week {currentWeekId}</p>
            </div>
          </Card>
        </Link>

        {/* Daily Habits */}
        <Link to="/dailyhabits" className="block group">
          <Card className="border-slate-800 bg-slate-900/80 p-4 h-full hover:border-orange-500/40 hover:bg-slate-900 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-500/10">
                  <Flame className="h-4 w-4 text-orange-400" />
                </div>
                <span className="font-semibold text-slate-200">Daily Habits</span>
              </div>
              <span className="text-xs font-bold text-yellow-300">{formatCurrency(habitsEarned)}</span>
            </div>
            {loadingHabits ? (
              <div className="flex items-center justify-center h-20">
                <div className="text-xs text-slate-500 animate-pulse">Loading habits...</div>
              </div>
            ) : habitData ? (
              <div className="space-y-2">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-extrabold text-orange-300">{habitData.completed}</span>
                  <span className="text-slate-400 text-sm mb-1">/ {habitData.total}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400" style={{ width: `${habitPct}%` }} />
                </div>
                <p className="text-xs text-slate-400">{habitPct}% complete today</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-2xl font-bold text-slate-500">—</p>
                <p className="text-xs text-slate-500">Sync to load habits</p>
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-slate-800">
              <p className="text-xs text-slate-500">Today's score</p>
            </div>
          </Card>
        </Link>

        {/* Learning */}
        <Link to="/dashboard" className="block group">
          <Card className="border-slate-800 bg-slate-900/80 p-4 h-full hover:border-sky-500/40 hover:bg-slate-900 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/10">
                  <BookOpen className="h-4 w-4 text-sky-400" />
                </div>
                <span className="font-semibold text-slate-200">Learning</span>
              </div>
              <span className="text-xs font-bold text-yellow-300">{formatCurrency(learningStats.sectionTotal)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs text-slate-400">Courses completed</span>
                <span className="ml-auto text-sm font-bold text-emerald-300">{learningStats.completed}/{learningStats.total}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-xs text-slate-400">In progress</span>
                <span className="ml-auto text-sm font-bold text-sky-300">{learningStats.inProgress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-yellow-400" />
                <span className="text-xs text-slate-400">Milestones done</span>
                <span className="ml-auto text-sm font-bold text-yellow-300">{learningStats.milestones}/{learningStats.totalMilestones}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400" style={{ width: `${Math.round((learningStats.milestones / learningStats.totalMilestones) * 100)}%` }} />
              </div>
            </div>
          </Card>
        </Link>

        {/* Goals */}
        <Link to="/goalstracker" className="block group">
          <Card className="border-slate-800 bg-slate-900/80 p-4 h-full hover:border-violet-500/40 hover:bg-slate-900 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-500/10">
                  <Target className="h-4 w-4 text-violet-400" />
                </div>
                <span className="font-semibold text-slate-200">Goals</span>
              </div>
              <span className="text-xs font-bold text-yellow-300">{formatCurrency(goalsEarned)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-end gap-1">
                <span className="text-3xl font-extrabold text-violet-300">{goalsStats.count}</span>
                <span className="text-slate-400 text-sm mb-1">in progress</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs text-slate-400">Completed goals</span>
                <span className="ml-auto text-sm font-bold text-emerald-300">{goalsStats.done}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-pink-400" style={{ width: `${Math.round((goalsStats.done / goalsStats.total) * 100)}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-1">{Math.round((goalsStats.done / goalsStats.total) * 100)}% of all goals done</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Quick nav bottom row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/walletdashboard">
          <Card className="border-slate-800 bg-slate-900/60 p-4 hover:border-yellow-500/30 hover:bg-slate-900 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Wallet className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-200">Wallet</p>
                <p className="text-xs text-slate-400">Monthly earnings tracker</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-lg font-bold text-yellow-300">{formatCurrency(totalWallet)}</p>
                <p className="text-xs text-slate-500">this month</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link to="/health">
          <Card className="border-slate-800 bg-slate-900/60 p-4 hover:border-cyan-500/30 hover:bg-slate-900 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Activity className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-200">Health</p>
                <p className="text-xs text-slate-400">Workout tracking & Strava</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-lg font-bold text-cyan-300">{totalSessions}</p>
                <p className="text-xs text-slate-500">sessions this week</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link to="/goalstracker">
          <Card className="border-slate-800 bg-slate-900/60 p-4 hover:border-violet-500/30 hover:bg-slate-900 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Goal className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-200">Goals</p>
                <p className="text-xs text-slate-400">In-progress goal tracker</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-lg font-bold text-violet-300">{goalsStats.count}</p>
                <p className="text-xs text-slate-500">active goals</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
