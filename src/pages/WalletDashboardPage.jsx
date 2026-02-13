import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { COURSES, GOALS, HEALTH_DATA, HABIT_CATEGORY_MAP, INCENTIVE_CONFIG } from '@/data/seedData'

export default function WalletDashboardPage() {
  const { sections, totalBaseBudget, totalMaxBudget, learningRate, goalsRate } = INCENTIVE_CONFIG

  const learning = Math.min(sections.learning.max, COURSES.reduce((sum, course) => {
    const ratio = course.status === 'completed' ? 1 : course.status === 'in_progress' ? 0.5 : 0
    return sum + Math.round(course.modules.length * ratio) * learningRate
  }, 0))
  const goals = Math.min(sections.goals.max, GOALS.filter(goal => goal.status === 'done').length * goalsRate)
  const health = Math.min(sections.health.max, HEALTH_DATA[HEALTH_DATA.length - 1].incentiveValue)
  const dailyHabitsTarget = Object.values(HABIT_CATEGORY_MAP).reduce((sum, h) => sum + h.points, 0)
  const dailyHabits = Math.min(sections.dailyHabits.max, Math.round((dailyHabitsTarget / 190) * sections.dailyHabits.base) + sections.dailyHabits.accelerator)
  const finance = Math.min(sections.finance.max, 200)

  const sectionValues = [
    ['Learning', learning, sections.learning],
    ['Habits', dailyHabits, sections.dailyHabits],
    ['Health', health, sections.health],
    ['Goals', goals, sections.goals],
    ['Finance', finance, sections.finance]
  ]
  const total = sectionValues.reduce((sum, [, value]) => sum + value, 0)

  return <div className="space-y-4">
    <h2 className="text-3xl font-bold">Your Wallet</h2>
    <Card>
      <p>Total budget: ₪{totalBaseBudget} base / ₪{totalMaxBudget} max</p>
      <Progress value={(total / totalMaxBudget) * 100} />
      <p className="mt-2">Total earned: ₪{total}</p>
    </Card>
    <div className="grid gap-3 md:grid-cols-2">
      {sectionValues.map(([name, value, config]) => (
        <Card key={name}>
          <p className="font-medium">{name}</p>
          <p>₪{value}/₪{config.base} base + ₪{config.accelerator} accelerator</p>
          <Progress value={(value / config.max) * 100} />
        </Card>
      ))}
    </div>
  </div>
}
