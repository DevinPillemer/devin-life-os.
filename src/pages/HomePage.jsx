import { motion } from 'framer-motion'
import { Bell, BookOpen, HeartPulse, Plus, Quote, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Screen } from '@/components/floopify/ObsidianShell'

const financeBars = [
  { name: 'M', value: 52 },
  { name: 'T', value: 78 },
  { name: 'W', value: 61 },
  { name: 'T', value: 84 },
  { name: 'F', value: 92 }
]

const focus = ['Finalize savings allocation', 'Complete typography lesson', 'Close rings before 8 PM']
const habits = [
  { label: 'Morning Meditation', done: true },
  { label: 'Read 20 Pages', done: false },
  { label: 'Drink 3L Water', done: false }
]

const goals = [
  { label: 'Emergency fund', value: 76 },
  { label: 'Travel budget', value: 54 },
  { label: 'Investing target', value: 68 }
]

const quickActions = [
  { icon: Plus, label: 'Add Expense', to: '/walletdashboard' },
  { icon: Bell, label: 'Log Habit', to: '/dailyhabits' },
  { icon: BookOpen, label: 'Start Lesson', to: '/learning' },
  { icon: HeartPulse, label: 'Check Health', to: '/health' }
]

const cards = [
  { title: 'Learning Progress', span: 'md:col-span-1' },
  { title: 'Wallets & Finance', span: 'md:col-span-1' },
  { title: 'Daily Habits', span: 'md:col-span-1' },
  { title: 'Health', span: 'md:col-span-1' },
  { title: 'Finance Goals', span: 'md:col-span-1' },
  { title: "Today's Focus", span: 'md:col-span-1' },
  { title: 'Quick Actions', span: 'md:col-span-2 xl:col-span-3' }
]

function AnimatedCard({ index, className = '', children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function DonutProgress({ value }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#2a2a2a" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#57f1db"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute font-heading text-2xl font-extrabold text-primary">{value}%</div>
    </div>
  )
}

export default function HomePage() {
  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <Screen includeBottomTabs>
      <div className="space-y-6">
        <div className="flex flex-col gap-5 rounded-[28px] border border-outline/20 bg-emerald-panel p-6 shadow-card lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <p className="font-heading text-3xl font-extrabold tracking-tight text-onsurface sm:text-4xl">Good Evening, Devin</p>
              <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary lg:hidden">
                <Bell className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-onsurface-variant">{dateLabel}</p>
            <div className="flex items-center gap-3">
              <div className="font-heading text-lg font-bold text-primary">Floopify</div>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">UI Refresh Live</span>
            </div>
          </div>
          <Card className="w-full max-w-sm border-primary/20 bg-surface-lowest/90 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-onsurface-variant">Wallet snapshot</p>
                <p className="mt-2 font-heading text-3xl font-extrabold text-primary">$12,450.00</p>
              </div>
              <div className="rounded-2xl bg-primary/15 p-3 text-primary"><Wallet className="h-5 w-5" /></div>
            </div>
            <p className="mt-3 text-sm text-primary">+12.5% from last month</p>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card, index) => (
            <AnimatedCard key={card.title} index={index} className={card.span}>
              {card.title === 'Learning Progress' && (
                <Card className="h-full bg-gradient-to-br from-surface-lowest via-surface to-surface-highest/40 p-5">
                  <p className="text-sm text-onsurface-variant">Learning Progress</p>
                  <div className="mt-4 flex items-center gap-4">
                    <DonutProgress value={78} />
                    <div>
                      <p className="font-heading text-xl font-bold text-onsurface">Advanced learning streak</p>
                      <p className="mt-2 text-sm text-onsurface-variant">3 modules remaining this week</p>
                      <Link to="/learning" className="mt-4 inline-flex text-sm font-medium text-primary">Resume curriculum</Link>
                    </div>
                  </div>
                </Card>
              )}

              {card.title === 'Wallets & Finance' && (
                <Card className="h-full bg-gradient-to-br from-surface-lowest to-secondary-container/10 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-onsurface-variant">Wallets & Finance</p>
                      <p className="mt-2 font-heading text-3xl font-extrabold text-onsurface">$12,450.00</p>
                      <p className="mt-1 text-sm text-primary">+12.5% from last month</p>
                    </div>
                  </div>
                  <div className="mt-5 flex h-32 items-end gap-3">
                    {financeBars.map((bar) => (
                      <div key={bar.name} className="flex flex-1 flex-col items-center gap-2">
                        <div className="w-full rounded-t-2xl bg-primary/90" style={{ height: `${bar.value}%` }} />
                        <span className="text-xs text-onsurface-variant">{bar.name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {card.title === 'Daily Habits' && (
                <Card className="h-full p-5">
                  <p className="text-sm text-onsurface-variant">Daily Habits</p>
                  <div className="mt-4 space-y-3">
                    {habits.map((habit) => (
                      <div key={habit.label} className="flex items-center justify-between rounded-2xl bg-surface-highest/15 px-4 py-3">
                        <span>{habit.label}</span>
                        <span className={`text-sm ${habit.done ? 'text-primary' : 'text-onsurface-variant'}`}>{habit.done ? '✅' : '•'}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {card.title === 'Health' && (
                <Card className="h-full p-5">
                  <p className="text-sm text-onsurface-variant">Health</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-surface-highest/15 p-4">
                      <p className="text-xs text-onsurface-variant">Health score</p>
                      <p className="mt-2 font-heading text-3xl font-extrabold text-primary">85</p>
                    </div>
                    <div className="rounded-2xl bg-surface-highest/15 p-4">
                      <p className="text-xs text-onsurface-variant">Heart rate</p>
                      <p className="mt-2 font-heading text-3xl font-extrabold text-tertiary">72 BPM</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-onsurface-variant">Sleep, hydration, and recovery are all trending up.</p>
                </Card>
              )}

              {card.title === 'Finance Goals' && (
                <Card className="h-full p-5">
                  <p className="text-sm text-onsurface-variant">Finance Goals</p>
                  <div className="mt-4 space-y-4">
                    {goals.map((goal) => (
                      <div key={goal.label}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span>{goal.label}</span>
                          <span className="text-primary">{goal.value}%</span>
                        </div>
                        <Progress value={goal.value} />
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {card.title === "Today's Focus" && (
                <Card className="h-full p-5">
                  <p className="text-sm text-onsurface-variant">Today's Focus</p>
                  <div className="mt-4 rounded-2xl bg-surface-highest/15 p-4">
                    <div className="flex items-start gap-3">
                      <Quote className="mt-1 h-4 w-4 text-primary" />
                      <p className="text-sm text-onsurface">"Small consistent steps compound into remarkable outcomes."</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {focus.map((item, idx) => <p key={item} className="text-sm text-onsurface-variant">0{idx + 1}. {item}</p>)}
                  </div>
                </Card>
              )}

              {card.title === 'Quick Actions' && (
                <Card className="h-full p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-onsurface-variant">Quick Actions</p>
                      <p className="mt-1 font-heading text-xl font-bold">Move through your day faster</p>
                    </div>
                    <Button className="hidden sm:inline-flex">Open Workspace</Button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {quickActions.map(({ icon: Icon, label, to }) => (
                      <Link key={label} to={to}>
                        <div className="rounded-2xl border border-outline/15 bg-surface-highest/15 p-4 text-center transition hover:border-primary/30 hover:bg-primary/10">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className="mt-3 text-sm font-medium">{label}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}
            </AnimatedCard>
          ))}
        </div>
      </div>
    </Screen>
  )
}
