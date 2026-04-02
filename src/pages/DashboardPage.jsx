import { Zap, Heart, DollarSign, BookOpen, ArrowRight, Plus, CheckSquare, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import AnimatedCounter from '../components/AnimatedCounter'
import { useApp } from '../context/AppContext'

function KpiCard({ icon: Icon, label, value, prefix, suffix, color, bgColor }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-all duration-300 hover:shadow-glow">
      <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center mb-3`}>
        <Icon size={20} className={color} />
      </div>
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">
        <AnimatedCounter end={value} prefix={prefix} suffix={suffix} />
      </p>
    </div>
  )
}

function HabitHeatmap({ data }) {
  const getColor = (count) => {
    if (count === 0) return 'bg-white/5'
    if (count === 1) return 'bg-accent/20'
    if (count === 2) return 'bg-accent/40'
    if (count === 3) return 'bg-accent/60'
    return 'bg-accent/90'
  }

  // Organize into weeks (columns of 7)
  const weeks = []
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7))
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Habit Activity (90 days)</h3>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                className={`w-3 h-3 rounded-sm ${getColor(day.count)} transition-colors`}
                title={`${day.date}: ${day.count} habits`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-white/5" />
        <div className="w-3 h-3 rounded-sm bg-accent/20" />
        <div className="w-3 h-3 rounded-sm bg-accent/40" />
        <div className="w-3 h-3 rounded-sm bg-accent/60" />
        <div className="w-3 h-3 rounded-sm bg-accent/90" />
        <span>More</span>
      </div>
    </div>
  )
}

function QuickActions() {
  const actions = [
    { icon: CheckSquare, label: 'Log Habits', to: '/habits', color: 'text-accent' },
    { icon: Target, label: 'Update Goals', to: '/goals', color: 'text-secondary' },
    { icon: BookOpen, label: 'Continue Learning', to: '/learning', color: 'text-warning' },
    { icon: Plus, label: 'Add New Goal', to: '/goals', color: 'text-success' },
  ]

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ icon: Icon, label, to, color }) => (
          <Link key={label} to={to} className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
            <Icon size={18} className={color} />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>
            <ArrowRight size={14} className="ml-auto text-gray-600 group-hover:text-gray-400 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { habits, heatmapData, courses } = useApp()
  const activeStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0)
  const totalXp = courses.reduce((sum, c) => sum + c.xp, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-gray-400 mt-1">Here&apos;s your life dashboard overview</p>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Zap} label="Best Streak" value={activeStreak} suffix=" days" color="text-accent" bgColor="bg-accent/10" />
        <KpiCard icon={Heart} label="Health Score" value={87} suffix="/100" color="text-rose-400" bgColor="bg-rose-400/10" />
        <KpiCard icon={DollarSign} label="Net Worth" value={284750} prefix="$" color="text-emerald-400" bgColor="bg-emerald-400/10" />
        <KpiCard icon={BookOpen} label="Learning XP" value={totalXp} suffix=" XP" color="text-secondary" bgColor="bg-secondary/10" />
      </div>

      {/* Heatmap + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <HabitHeatmap data={heatmapData} />
        </div>
        <QuickActions />
      </div>
    </div>
  )
}
