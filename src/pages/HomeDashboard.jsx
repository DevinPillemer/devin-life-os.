import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle2,
  Droplets,
  Dumbbell,
  HeartPulse,
  Moon,
  Plus,
  SmilePlus,
} from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BUDGET_DATA, COURSES, GOALS, HABIT_CATEGORY_MAP } from '@/data/seedData'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const mockTransactions = [
  { id: 't1', name: 'Groceries', amount: -184, when: '10:35' },
  { id: 't2', name: 'Coffee', amount: -22, when: '08:42' },
  { id: 't3', name: 'Salary Bonus', amount: 450, when: 'Yesterday' }
]

const weeklyHealth = [
  { day: 'M', score: 72 },
  { day: 'T', score: 79 },
  { day: 'W', score: 68 },
  { day: 'T', score: 85 },
  { day: 'F', score: 74 },
  { day: 'S', score: 80 },
  { day: 'S', score: 77 }
]

const focusTasks = [
  'Review weekly budget and rebalance envelopes',
  'Complete AI/Tech Learning module',
  'Finalize tomorrow\'s top 3 habits in Habitify'
]

const todaysEvents = [
  { time: '10:00', title: 'Deep work sprint' },
  { time: '14:30', title: 'Workout + mobility' }
]

const quickActions = [
  { label: 'Log Workout', icon: Dumbbell, to: '/health' },
  { label: 'Add Expense', icon: Plus, to: '/financialdashboards?type=personal' },
  { label: 'Start Learning', icon: BookOpen, to: '/learning' },
  { label: 'Log Mood', icon: SmilePlus, to: '/health' },
  { label: 'Add Task', icon: CheckCircle2, to: '/goalstracker' }
]

const getGreeting = (name) => {
  const hour = new Date().getHours()
  const partOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
  return `Good ${partOfDay}, ${name}`
}

const getCourseProgress = (course) => {
  if (course.status === 'completed') return 100
  if (course.status === 'not_started') return 0
  return Math.round((Math.floor(course.modules.length / 2) / course.modules.length) * 100)
}

const shellClass = 'border-slate-800 bg-slate-900/80 shadow-xl shadow-black/20'

export default function HomeDashboard() {
  const navigate = useNavigate()
  const [syncData] = useLocalStorage('habitify-sync-data', { habits: [], journal: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 650)
    return () => window.clearTimeout(timer)
  }, [])

  const dashboardData = useMemo(() => {
    const userName = 'Devin'

    const activeCourses = COURSES.filter(course => course.status !== 'completed').slice(0, 3)
    const xpPoints = COURSES.reduce((sum, course) => sum + Math.round((getCourseProgress(course) / 100) * 120), 0)

    const completedHabitNames = new Set(
      (syncData?.journal || [])
        .filter(entry => entry?.status === 'completed')
        .map(entry => (entry?.habit_name || entry?.name || '').trim().toLowerCase())
        .filter(Boolean)
    )

    const allHabits = Object.keys(HABIT_CATEGORY_MAP)
    const todaysHabits = allHabits.slice(0, 5).map(habit => ({
      name: habit,
      done: completedHabitNames.has(habit.trim().toLowerCase())
    }))

    const completedHabitsCount = allHabits.filter(habit => completedHabitNames.has(habit.trim().toLowerCase())).length
    const streak = Math.max(2, completedHabitsCount % 9)

    const budget = BUDGET_DATA['Feb-26']
    const expenseEntries = Object.entries(budget.expenses)
    const spentToday = 486
    const dailyBudget = Math.round(expenseEntries.reduce((sum, [, value]) => sum + value, 0) / 30)

    const inProgressGoals = GOALS.filter(goal => goal.status === 'in_progress').slice(0, 3)
      .map(goal => ({
        ...goal,
        progress: 25 + ((goal.title.length * 9) % 60)
      }))

    return {
      userName,
      activeCourses,
      xpPoints,
      learningStreak: 6,
      netWorth: 184200,
      spentToday,
      dailyBudget,
      transactions: mockTransactions,
      todaysHabits,
      completedHabitsCount,
      totalHabits: allHabits.length,
      streak,
      health: {
        steps: 8420,
        sleep: '7h 48m',
        water: '2.1L / 3L'
      },
      goals: inProgressGoals,
      nextMilestone: 'Emergency Fund at ₪15,000',
      daysRemaining: 42
    }
  }, [syncData])

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/50 p-5 shadow-2xl shadow-cyan-950/20"
      >
        {loading ? <HeaderSkeleton /> : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/80">Home Dashboard</p>
              <h1 className="mt-2 text-3xl font-extrabold text-white">{getGreeting(dashboardData.userName)}</h1>
              <p className="mt-1 text-slate-300">{format(new Date(), 'EEEE, MMMM do')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate('/learning')} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">Resume Learning</Button>
              <Button variant="outline" onClick={() => navigate('/walletdashboard')} className="border-slate-600 text-slate-100">Open Wallet</Button>
            </div>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard to="/learning" index={0} title="🎓 Learning" loading={loading}>
          <p className="mb-3 text-sm text-slate-300">{dashboardData.learningStreak}-day streak • {dashboardData.xpPoints} XP</p>
          <div className="space-y-3">
            {dashboardData.activeCourses.map(course => (
              <div key={course.id}>
                <div className="mb-1 flex justify-between text-sm text-slate-200">
                  <span className="truncate pr-2">{course.title}</span>
                  <span>{getCourseProgress(course)}%</span>
                </div>
                <Progress value={getCourseProgress(course)} />
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full">Next Lesson</Button>
        </DashboardCard>

        <DashboardCard to="/walletdashboard" index={1} title="💰 Wallets & Finance" loading={loading}>
          <p className="text-2xl font-bold text-emerald-300">₪{dashboardData.netWorth.toLocaleString()}</p>
          <p className="text-sm text-slate-300">Net worth summary</p>
          <p className="mt-2 text-sm text-slate-300">Today: ₪{dashboardData.spentToday} / ₪{dashboardData.dailyBudget} budget</p>
          <ul className="mt-3 space-y-2 text-sm">
            {dashboardData.transactions.map(tx => (
              <li key={tx.id} className="flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 py-2">
                <span className="text-slate-200">{tx.name}</span>
                <span className={tx.amount < 0 ? 'text-rose-300' : 'text-emerald-300'}>{tx.amount < 0 ? '-' : '+'}₪{Math.abs(tx.amount)}</span>
              </li>
            ))}
          </ul>
          <Button className="mt-4 w-full">Quick-add Expense</Button>
        </DashboardCard>

        <DashboardCard to="/dailyhabits" index={2} title="✅ Habits" loading={loading}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-teal-300">{dashboardData.completedHabitsCount}/{dashboardData.totalHabits}</p>
              <p className="text-sm text-slate-300">Completed today</p>
            </div>
            <div className="rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-sm text-teal-200">🔥 {dashboardData.streak}d streak</div>
          </div>
          <div className="space-y-2">
            {dashboardData.todaysHabits.map(habit => (
              <button type="button" key={habit.name} className="flex w-full items-center justify-between rounded-lg border border-slate-700/70 px-3 py-2 text-left text-sm">
                <span className="truncate pr-3 text-slate-200">{habit.name}</span>
                <span className={habit.done ? 'text-emerald-300' : 'text-slate-500'}>{habit.done ? '☑' : '☐'}</span>
              </button>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard to="/health" index={3} title="❤️ Health" loading={loading}>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <StatPill icon={HeartPulse} label="Steps" value={dashboardData.health.steps.toLocaleString()} />
            <StatPill icon={Moon} label="Sleep" value={dashboardData.health.sleep} />
            <StatPill icon={Droplets} label="Water" value={dashboardData.health.water} />
          </div>
          <Button className="mt-3 w-full">Mood Check-in</Button>
          <div className="mt-4 h-28 rounded-lg border border-slate-700/70 bg-slate-950/70 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyHealth}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis hide domain={[40, 100]} />
                <Bar dataKey="score" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        <DashboardCard to="/goalstracker" index={4} title="📈 Finance Goals" loading={loading}>
          <div className="space-y-3">
            {dashboardData.goals.map(goal => (
              <div key={goal.id}>
                <div className="mb-1 flex justify-between text-sm text-slate-200">
                  <span className="truncate pr-2">{goal.title}</span>
                  <span>{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} />
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-300">Next milestone: <span className="text-white">{dashboardData.nextMilestone}</span></p>
          <p className="text-sm text-cyan-300">{dashboardData.daysRemaining} days remaining</p>
        </DashboardCard>

        <DashboardCard to="/goalstracker" index={5} title="🗓️ Today's Focus" loading={loading}>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-200">
            {focusTasks.map(task => <li key={task}>{task}</li>)}
          </ol>
          <div className="mt-4 rounded-lg border border-slate-700/70 bg-slate-900/80 p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Calendar</p>
            {todaysEvents.map(event => (
              <div key={event.time} className="mb-1 flex justify-between text-sm text-slate-300">
                <span>{event.title}</span>
                <span>{event.time}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <DashboardCard to="/dashboard" index={6} title="⚡ Quick Actions" loading={loading} className="p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {quickActions.map(action => {
            const Icon = action.icon
            return (
              <Link key={action.label} to={action.to} className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-400/60 hover:text-cyan-200" onClick={(event) => event.stopPropagation()}>
                <Icon className="h-4 w-4" />
                <span>{action.label}</span>
              </Link>
            )
          })}
        </div>
      </DashboardCard>
    </div>
  )
}

function DashboardCard({ to, title, children, index, loading, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
    >
      <Link to={to} className="block">
        <Card className={`${shellClass} h-full p-5 transition hover:-translate-y-1 hover:border-cyan-400/40 ${className}`}>
          <h2 className="mb-4 text-lg font-bold text-white">{title}</h2>
          {loading ? <CardSkeleton /> : children}
        </Card>
      </Link>
    </motion.div>
  )
}

function CardSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-700" />
      <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-slate-800" />
      <div className="h-10 w-full animate-pulse rounded-lg bg-slate-700/80" />
    </div>
  )
}

function HeaderSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-3 w-32 animate-pulse rounded bg-slate-700" />
      <div className="h-8 w-72 animate-pulse rounded bg-slate-700" />
      <div className="h-4 w-52 animate-pulse rounded bg-slate-800" />
    </div>
  )
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-2">
      <div className="mb-1 flex items-center justify-center gap-1 text-xs text-slate-400"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <p className="font-semibold text-slate-100">{value}</p>
    </div>
  )
}
