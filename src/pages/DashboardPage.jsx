import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Brain, CalendarDays, CheckCircle2, Flame, Plus, Sparkles, TrendingUp, Trophy, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { COURSES, INCENTIVE_CONFIG } from '@/data/seedData'

const MILESTONE_REWARD = 10

const QUOTES = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier' },
  { text: 'Small daily improvements over time lead to stunning results.', author: 'Robin Sharma' }
]

const WEEK_DAYS = [
  { day: 'Mon', score: 0.8 },
  { day: 'Tue', score: 0.6 },
  { day: 'Wed', score: 0.9 },
  { day: 'Thu', score: 0.75 },
  { day: 'Fri', score: 0.7 },
  { day: 'Sat', score: 0.55 },
  { day: 'Sun', score: 0.85 }
]

const statusMeta = {
  completed: { label: 'Completed', tone: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/40' },
  in_progress: { label: 'In Progress', tone: 'text-sky-300 bg-sky-500/10 border-sky-500/40' },
  not_started: { label: 'Not Started', tone: 'text-slate-300 bg-slate-500/10 border-slate-500/40' }
}

const formatCurrency = (value) => `₪${value.toLocaleString()}`

const getProgressForCourse = (course) => {
  if (course.status === 'completed') return 100
  if (course.status === 'not_started') return 0
  return Math.round((Math.floor(course.modules.length / 2) / course.modules.length) * 100)
}

export default function DashboardPage() {
  const [customCourses, setCustomCourses] = useState([])
  const [todayQuote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])

  useEffect(() => {
    const stored = localStorage.getItem('customCourses')
    if (stored) setCustomCourses(JSON.parse(stored))
  }, [])

  const allCourses = [...COURSES, ...customCourses]

  const dashboard = useMemo(() => {
    const completedCourses = allCourses.filter(course => course.status === 'completed').length
    const completedModules = allCourses.reduce((sum, course) => {
      const progress = getProgressForCourse(course)
      return sum + Math.round((progress / 100) * course.modules.length)
    }, 0)

    const totalModules = allCourses.reduce((sum, course) => sum + course.modules.length, 0)
    const totalEarned = Math.min(
      INCENTIVE_CONFIG.sections.learning.base,
      completedModules * MILESTONE_REWARD
    )

    const acceleratorUnlocked = completedCourses >= 7
    const accelerator = acceleratorUnlocked ? INCENTIVE_CONFIG.sections.learning.accelerator : 0
    const sectionTotal = totalEarned + accelerator
    const completionRate = totalModules ? Math.round((completedModules / totalModules) * 100) : 0

    const topCourses = [...allCourses]
      .sort((a, b) => getProgressForCourse(b) - getProgressForCourse(a))
      .slice(0, 4)

    const activeCourses = allCourses.filter(course => course.status !== 'completed').slice(0, 5)

    return {
      completedCourses,
      completedModules,
      totalModules,
      totalEarned,
      accelerator,
      sectionTotal,
      completionRate,
      acceleratorUnlocked,
      topCourses,
      activeCourses
    }
  }, [allCourses])

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/70 p-6 shadow-2xl shadow-blue-900/20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-300">
              <Sparkles className="h-3.5 w-3.5" />
              Learning Command Center
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Bold learning. Beautiful progress.</h1>
            <p className="max-w-2xl text-slate-300">"{todayQuote.text}" — {todayQuote.author}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/createcourse">
              <Button className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                <Plus className="mr-2 h-4 w-4" />
                New Course
              </Button>
            </Link>
            <Link to="/walletdashboard">
              <Button variant="outline" className="border-slate-600 text-slate-100 hover:bg-slate-800">
                <Wallet className="mr-2 h-4 w-4" />
                Wallet
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={BookOpen} label="Courses" value={`${dashboard.completedCourses}/${allCourses.length}`} hint="completed" tone="text-sky-300" />
          <MetricCard icon={CheckCircle2} label="Milestones" value={`${dashboard.completedModules}/${dashboard.totalModules}`} hint={`${dashboard.completionRate}% complete`} tone="text-emerald-300" />
          <MetricCard icon={Flame} label="Learning Streak" value="6 days" hint="1 day to booster" tone="text-orange-300" />
          <MetricCard icon={Wallet} label="This Month" value={formatCurrency(dashboard.sectionTotal)} hint={`of ${formatCurrency(INCENTIVE_CONFIG.sections.learning.max)} max`} tone="text-yellow-300" />
        </div>
      </Card>

      <Card className="border-slate-800 bg-slate-900/80 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Monthly Learning Reward</h2>
          <span className="text-sm text-slate-300">{formatCurrency(INCENTIVE_CONFIG.sections.learning.base)} base + {formatCurrency(INCENTIVE_CONFIG.sections.learning.accelerator)} accelerator</span>
        </div>
        <div className="mb-2 flex items-end justify-between">
          <p className="text-4xl font-extrabold text-emerald-300">{formatCurrency(dashboard.sectionTotal)}</p>
          <p className="text-sm text-slate-400">{formatCurrency(INCENTIVE_CONFIG.sections.learning.max)} max</p>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
            style={{ width: `${Math.min(100, (dashboard.sectionTotal / INCENTIVE_CONFIG.sections.learning.max) * 100)}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-emerald-300">Base: {formatCurrency(dashboard.totalEarned)} / {formatCurrency(INCENTIVE_CONFIG.sections.learning.base)}</span>
          <span className={dashboard.acceleratorUnlocked ? 'text-yellow-300' : 'text-slate-400'}>
            <Trophy className="mr-1 inline h-4 w-4" />
            Accelerator: {formatCurrency(dashboard.accelerator)} / {formatCurrency(INCENTIVE_CONFIG.sections.learning.accelerator)}
          </span>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-slate-800 bg-slate-900/70 p-5 xl:col-span-2">
          <h2 className="mb-4 text-xl font-bold text-white">Top Course Breakdown</h2>
          <div className="space-y-3">
            {dashboard.topCourses.map(course => {
              const pct = getProgressForCourse(course)
              const meta = statusMeta[course.status]
              return (
                <div key={course.id} className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-100">{course.title}</p>
                      <p className="text-xs text-slate-400">{course.author}</p>
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${meta.tone}`}>{meta.label}</span>
                  </div>
                  <div className="mb-1 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-400">{pct}% complete • {Math.round((pct / 100) * course.modules.length)}/{course.modules.length} milestones</p>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="border-slate-800 bg-slate-900/70 p-5">
          <h2 className="mb-4 text-xl font-bold text-white">This Week</h2>
          <div className="mb-4 grid grid-cols-7 gap-2">
            {WEEK_DAYS.map(entry => (
              <div key={entry.day} className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-center">
                <p className="text-xs text-slate-400">{entry.day}</p>
                <p className="text-sm font-bold text-slate-200">{Math.round(entry.score * 100)}%</p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${entry.score * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="mb-2 text-sm text-slate-400">Active Queue</p>
            <ul className="space-y-2">
              {dashboard.activeCourses.length === 0 && <li className="text-sm text-slate-400">All courses completed. Add a new challenge.</li>}
              {dashboard.activeCourses.map(course => (
                <li key={course.id} className="flex items-center justify-between text-sm">
                  <span className="truncate pr-3 text-slate-200">{course.title}</span>
                  <span className="font-semibold text-sky-300">{getProgressForCourse(course)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <Card className="border-slate-800 bg-gradient-to-r from-slate-900 to-blue-950/40 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Next milestone target</h3>
            <p className="text-sm text-slate-300">Complete 2 modules today to add {formatCurrency(20)} and push your rank.</p>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <BadgeStat icon={Brain} label="Focus Block" value="45m" />
            <BadgeStat icon={TrendingUp} label="Momentum" value="Strong" />
            <BadgeStat icon={CalendarDays} label="Sync" value="Today" />
          </div>
        </div>
      </Card>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, hint, tone }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${tone}`}>{value}</p>
      <p className="text-xs text-slate-400">{hint}</p>
    </div>
  )
}

function BadgeStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <p className="font-bold text-slate-100">{value}</p>
    </div>
  )
}
