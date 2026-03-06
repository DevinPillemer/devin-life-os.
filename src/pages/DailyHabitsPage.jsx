import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { CheckCircle2, Circle, RefreshCw, Zap, Trophy, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { HABIT_CATEGORY_MAP, INCENTIVE_CONFIG } from '@/data/seedData'

const categoryColors = {
  Health:   { badge: 'bg-green-600/20 text-green-300 border border-green-600/20',   dot: 'bg-green-400',  header: 'text-green-400' },
  Spiritual:{ badge: 'bg-purple-600/20 text-purple-300 border border-purple-600/20', dot: 'bg-purple-400', header: 'text-purple-400' },
  Focus:    { badge: 'bg-blue-600/20 text-blue-300 border border-blue-600/20',       dot: 'bg-blue-400',   header: 'text-blue-400' },
  Learning: { badge: 'bg-orange-600/20 text-orange-300 border border-orange-600/20', dot: 'bg-orange-400', header: 'text-orange-400' },
  Lifestyle:{ badge: 'bg-pink-600/20 text-pink-300 border border-pink-600/20',       dot: 'bg-pink-400',   header: 'text-pink-400' }
}

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2 bg-card/60 border border-border/50 rounded-xl px-4 py-3">
      <Icon size={16} className={color} />
      <div>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  )
}

export default function DailyHabitsPage() {
  const [lastSync, setLastSync] = useLocalStorage('habitify-last-sync', null)
  // habits: array from Habitify Journal API with name + status fields
  const [habits, setHabits] = useLocalStorage('habitify-habits-data', [])
  const [syncError, setSyncError] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const apiKey = import.meta.env.VITE_HABITIFY_API_KEY

  // Build a set of completed habit names from the live API data
  const completedHabitNames = useMemo(() => {
    const normalize = s => (s || '').trim().toLowerCase()
    return new Set(
      habits
        .filter(h => h.status === 'completed' || h.status === 'passed' || h.is_done === true)
        .map(h => normalize(h.name || h.habit_name || h.title))
        .filter(Boolean)
    )
  }, [habits])

  const entries = Object.entries(HABIT_CATEGORY_MAP)

  const apiHabitNames = useMemo(() => {
    const normalize = s => (s || '').trim().toLowerCase()
    return new Set(habits.map(h => normalize(h.name || h.habit_name || h.title)).filter(Boolean))
  }, [habits])

  const grouped = entries.reduce((acc, [habit, meta]) => {
    if (!acc[meta.category]) acc[meta.category] = []
    const normalized = habit.trim().toLowerCase()
    const isCompleted = completedHabitNames.has(normalized)
    const isInAPI = apiHabitNames.has(normalized)
    acc[meta.category].push({ habit, isCompleted, isInAPI, ...meta })
    return acc
  }, {})

  const apiEntries = entries.filter(([habit]) => apiHabitNames.has(habit.trim().toLowerCase()))
  const dailyMaxPoints = apiEntries.length > 0
    ? apiEntries.reduce((sum, [, meta]) => sum + meta.points, 0)
    : entries.reduce((sum, [, meta]) => sum + meta.points, 0)
  const completedPoints = entries
    .filter(([habit]) => completedHabitNames.has(habit.trim().toLowerCase()))
    .reduce((sum, [, meta]) => sum + meta.points, 0)
  const completedCount = completedHabitNames.size
  const totalFromAPI = habits.length
  const pct = dailyMaxPoints > 0 ? Math.round((completedPoints / dailyMaxPoints) * 100) : 0

  const monthlyBase = INCENTIVE_CONFIG.sections.dailyHabits.base
  const monthlyAccelerator = INCENTIVE_CONFIG.sections.dailyHabits.accelerator
  const monthlyReward = Math.min(
    monthlyBase + monthlyAccelerator,
    Math.round((completedPoints / dailyMaxPoints) * monthlyBase) + (pct >= 90 ? monthlyAccelerator : 0)
  )

  const handleSync = async () => {
    if (!apiKey) {
      setSyncError('Habitify API key is missing. Add VITE_HABITIFY_API_KEY to your environment.')
      return
    }
    setSyncError(null)
    setIsSyncing(true)
    try {
      const todayDate = format(new Date(), 'yyyy-MM-dd')
      // Use the Journal endpoint which returns habits WITH their completion status for a given date
      const targetDate = `${todayDate}T00:00:00+00:00`
      const res = await fetch(
        `https://api.habitify.me/journal?target_date=${encodeURIComponent(targetDate)}`,
        { headers: { Authorization: apiKey } }
      )
      const responseText = await res.text()
      if (!res.ok) {
        throw new Error(`Habitify API error (${res.status}): ${responseText.substring(0, 200)}`)
      }
      let payload
      try {
        payload = JSON.parse(responseText)
      } catch {
        throw new Error('Could not parse Habitify response as JSON')
      }
      // Journal API returns { data: [...habits], status: true }
      const habitsArray = Array.isArray(payload) ? payload : (payload?.data || [])
      if (!Array.isArray(habitsArray) || habitsArray.length === 0) {
        throw new Error(`No habits returned from journal. Keys: ${Object.keys(payload || {}).join(', ')}`)
      }
      setHabits(habitsArray)
      setLastSync(new Date().toISOString())
    } catch (error) {
      setSyncError(error.message || 'Failed to sync Habitify data.')
    } finally {
      setIsSyncing(false)
    }
  }

  const categoryOrder = ['Health', 'Focus', 'Learning', 'Spiritual', 'Lifestyle']

  return (
    <div className="space-y-5 rounded-xl bg-slate-950 p-4 text-white">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daily Habits</h2>
          <p className="text-xs text-muted mt-0.5">
            Last sync: {lastSync ? format(new Date(lastSync), 'PPpp') : 'Never'} &bull;{' '}
            API: {apiKey ? <span className="text-green-400">configured</span> : <span className="text-red-400">missing</span>}
            {totalFromAPI > 0 && <span className="text-muted"> &bull; {totalFromAPI} habits loaded</span>}
          </p>
        </div>
        <Button onClick={handleSync} disabled={isSyncing} className="gap-2">
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>

      {syncError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300">
          <strong>Error:</strong> {syncError}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill icon={CheckCircle2} label="Completed" value={totalFromAPI > 0 ? `${completedCount}/${totalFromAPI}` : `0/--`} color="text-green-400" />
        <StatPill icon={Zap} label="Points Today" value={`${completedPoints}/${dailyMaxPoints}`} color="text-amber-400" />
        <StatPill icon={Trophy} label="Score" value={`${pct}%`} color={pct >= 80 ? 'text-primary' : pct >= 50 ? 'text-yellow-400' : 'text-muted'} />
        <StatPill icon={Clock} label="Monthly Reward" value={`₪${monthlyReward}`} color="text-primary" />
      </div>

      {/* Progress Bar */}
      <Card className="border border-border/50 bg-card/60 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">Today's Progress</span>
          <span className="text-sm font-bold text-primary">{pct}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              pct >= 90 ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
              : pct >= 60 ? 'bg-gradient-to-r from-blue-500 to-teal-500'
              : 'bg-gradient-to-r from-slate-600 to-blue-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted">
          <span>0 pts</span>
          <span>{dailyMaxPoints} pts max</span>
        </div>
      </Card>

      {/* No data state */}
      {totalFromAPI === 0 && !isSyncing && (
        <Card className="border border-border/30 bg-card/40 p-6 text-center">
          <RefreshCw size={24} className="mx-auto mb-2 text-muted" />
          <p className="text-slate-300 font-medium">No habit data loaded yet</p>
          <p className="text-muted text-sm mt-1">Click "Sync Now" to fetch today's habits from Habitify</p>
        </Card>
      )}

      {/* Habit Categories */}
      <div className="space-y-3">
        {categoryOrder.map(category => {
          const categoryHabits = grouped[category]
          if (!categoryHabits?.length) return null
          const colors = categoryColors[category] || categoryColors.Health
          const catCompleted = categoryHabits.filter(h => h.isCompleted).length
          const catTotal = categoryHabits.length
          return (
            <Card key={category} className="border border-border/50 bg-card/60 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50/60">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${colors.header}`}>{category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{catCompleted}/{catTotal}</span>
                  <span className={`text-xs rounded-full px-2 py-0.5 ${colors.badge}`}>
                    {catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="divide-y divide-slate-800/40">
                {categoryHabits.map(({ habit, points, isCompleted, isInAPI }) => (
                  <div
                    key={habit}
                    className={`flex items-center justify-between px-4 py-2.5 transition-colors ${
                      isCompleted ? 'bg-green-500/5' : ''
                    } ${!isInAPI && totalFromAPI > 0 ? 'opacity-40' : ''}`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isCompleted
                        ? <CheckCircle2 size={15} className="text-green-400 flex-shrink-0" />
                        : <Circle size={15} className={`flex-shrink-0 ${!isInAPI && totalFromAPI > 0 ? 'text-slate-700' : 'text-slate-600'}`} />
                      }
                      <span className={`text-sm ${isCompleted ? 'text-white' : 'text-muted'}`}>
                        {habit}
                      </span>
                    </div>
                    <span className={`text-xs font-medium ${isCompleted ? 'text-green-400' : 'text-muted'}`}>
                      {points} pts
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
