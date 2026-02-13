import { Card } from '@/components/ui/card'
import { GOALS } from '@/data/seedData'

const areas = ['Learning', 'Family_Life', 'Finance', 'Career']
const statusStyles = {
  done: 'bg-green-600/20 text-green-300',
  in_progress: 'bg-yellow-600/20 text-yellow-300',
  todo: 'bg-gray-600/30 text-gray-200'
}

export default function GoalsTrackerPage() {
  const completed = GOALS.filter(goal => goal.status === 'done')
  const creditsEarned = completed.reduce((sum, goal) => sum + goal.credits, 0)

  return <div className="space-y-4">
    <h2 className="text-2xl font-bold">Goals Tracker</h2>
    <p className="text-sm text-gray-300">Progress: {completed.length}/{GOALS.length} goals completed • Credits earned: {creditsEarned}</p>

    {areas.map(area => (
      <section key={area} className="space-y-2">
        <h3 className="font-semibold">{area}</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {GOALS.filter(goal => goal.area === area).map(goal => (
            <Card key={goal.id} className="flex items-center justify-between gap-3">
              <span>{goal.title}</span>
              <div className="flex items-center gap-2">
                {goal.status === 'done' && <span className="text-sm">+{goal.credits}</span>}
                <span className={`rounded px-2 py-1 text-xs ${statusStyles[goal.status]}`}>{goal.status}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    ))}
  </div>
}
