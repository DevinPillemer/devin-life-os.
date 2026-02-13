import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { HABIT_CATEGORY_MAP, INCENTIVE_CONFIG } from '@/data/seedData'

const badgeColors = {
  Health: 'bg-green-600/20 text-green-300',
  Spiritual: 'bg-purple-600/20 text-purple-300',
  Focus: 'bg-blue-600/20 text-blue-300',
  Learning: 'bg-orange-600/20 text-orange-300',
  Lifestyle: 'bg-pink-600/20 text-pink-300'
}

export default function DailyHabitsPage() {
  const [lastSync, setLastSync] = useLocalStorage('habitify-last-sync', null)
  const [syncData, setSyncData] = useLocalStorage('habitify-sync-data', { habits: [], journal: [] })
  const [syncError, setSyncError] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const apiKey = import.meta.env.VITE_HABITIFY_API_KEY
  const entries = Object.entries(HABIT_CATEGORY_MAP)

  const completedHabitNames = useMemo(() => {
    const normalize = value => (value || '').trim().toLowerCase()

    return new Set((syncData?.journal || [])
      .filter(entry => entry?.status === 'completed')
      .map(entry => normalize(entry?.habit_name || entry?.name || entry?.habit?.name || entry?.task_name || entry?.title))
      .filter(Boolean))
  }, [syncData])

  const grouped = entries.reduce((acc, [habit, meta]) => {
    if (!acc[meta.category]) acc[meta.category] = []
    const isCompleted = completedHabitNames.has(habit.trim().toLowerCase())
    acc[meta.category].push({ habit, isCompleted, ...meta })
    return acc
  }, {})

  const dailyMaxPoints = entries.reduce((sum, [, meta]) => sum + meta.points, 0)
  const completedCount = entries.filter(([habit]) => completedHabitNames.has(habit.trim().toLowerCase())).length
  const monthlyBase = INCENTIVE_CONFIG.sections.dailyHabits.base
  const monthlyReward = Math.min(monthlyBase + INCENTIVE_CONFIG.sections.dailyHabits.accelerator, Math.round((dailyMaxPoints / 190) * monthlyBase) + INCENTIVE_CONFIG.sections.dailyHabits.accelerator)

  const handleSync = async () => {
    if (!apiKey) {
      setSyncError('Habitify API key is missing. Add VITE_HABITIFY_API_KEY to enable sync.')
      return
    }

    setSyncError(null)
    setIsSyncing(true)

    try {
      const todayWithTimezone = `${format(new Date(), 'yyyy-MM-dd')}T00:00:00+03:00`
      const commonHeaders = { Authorization: apiKey }

      const [habitsRes, journalRes] = await Promise.all([
        fetch('https://api.habitify.me/habits', { headers: commonHeaders }),
        fetch(`https://api.habitify.me/journal?target_date=${encodeURIComponent(todayWithTimezone)}`, { headers: commonHeaders })
      ])

      if (!habitsRes.ok || !journalRes.ok) {
        throw new Error(`Sync failed (${habitsRes.status}/${journalRes.status})`)
      }

      const habitsPayload = await habitsRes.json()
      const journalPayload = await journalRes.json()

      if (!habitsPayload?.status || !journalPayload?.status) {
        throw new Error('Habitify API returned an unsuccessful response.')
      }

      setSyncData({
        habits: habitsPayload?.data || [],
        journal: journalPayload?.data || []
      })
      setLastSync(new Date().toISOString())
    } catch (error) {
      setSyncError(error.message || 'Failed to sync Habitify data.')
    } finally {
      setIsSyncing(false)
    }
  }

  return <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">Daily Habits</h2>
      <Button onClick={handleSync} disabled={isSyncing}>{isSyncing ? 'Syncing...' : 'Sync Now'}</Button>
    </div>
    <p className="text-sm text-gray-400">Last sync: {lastSync ? format(new Date(lastSync), 'PPpp') : 'Never'} • Habitify API: https://api.habitify.me • API Key: {apiKey ? 'configured' : 'missing'}</p>
    {syncError && <p className="text-sm text-red-300">{syncError}</p>}
    <p className="text-sm">Today&apos;s score: {completedCount}/{entries.length} completed</p>
    <p className="text-sm">Daily max points: {dailyMaxPoints} pts/day • Monthly reward: ₪{monthlyReward} (capped at ₪240)</p>

    {Object.entries(grouped).map(([category, habits]) => (
      <Card key={category} className="space-y-2">
        <h3 className={`inline-block rounded px-2 py-1 text-xs ${badgeColors[category]}`}>{category}</h3>
        {habits.map(({ habit, points, isCompleted }) => (
          <div key={habit} className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <span>{habit}</span>
              {isCompleted && <span className="text-green-400" aria-label="completed">✓</span>}
            </span>
            <span>{points} pts</span>
          </div>
        ))}
      </Card>
    ))}
  </div>
}
