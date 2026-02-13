import { format } from 'date-fns'
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
  const entries = Object.entries(HABIT_CATEGORY_MAP)
  const grouped = entries.reduce((acc, [habit, meta]) => {
    if (!acc[meta.category]) acc[meta.category] = []
    acc[meta.category].push({ habit, ...meta })
    return acc
  }, {})

  const dailyMaxPoints = entries.reduce((sum, [, meta]) => sum + meta.points, 0)
  const monthlyBase = INCENTIVE_CONFIG.sections.dailyHabits.base
  const monthlyReward = Math.min(monthlyBase + INCENTIVE_CONFIG.sections.dailyHabits.accelerator, Math.round((dailyMaxPoints / 190) * monthlyBase) + INCENTIVE_CONFIG.sections.dailyHabits.accelerator)

  return <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">Daily Habits</h2>
      <Button onClick={() => setLastSync(new Date().toISOString())}>Sync Now</Button>
    </div>
    <p className="text-sm text-gray-400">Last sync: {lastSync ? format(new Date(lastSync), 'PPpp') : 'Never'} • Habitify API: https://api.habitify.me • Auth: <code>Authorization: Bearer ${'{VITE_HABITIFY_API_KEY}'}</code></p>
    <p className="text-sm">Daily max points: {dailyMaxPoints} pts/day • Monthly reward: ₪{monthlyReward} (capped at ₪240)</p>

    {Object.entries(grouped).map(([category, habits]) => (
      <Card key={category} className="space-y-2">
        <h3 className={`inline-block rounded px-2 py-1 text-xs ${badgeColors[category]}`}>{category}</h3>
        {habits.map(({ habit, points }) => (
          <div key={habit} className="flex justify-between text-sm">
            <span>{habit}</span>
            <span>{points} pts</span>
          </div>
        ))}
      </Card>
    ))}
  </div>
}
