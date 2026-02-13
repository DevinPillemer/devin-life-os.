import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import CashKpiStrip from '@/components/dashboard/CashKpiStrip'
import { COURSES, INCENTIVE_CONFIG } from '@/data/seedData'

const statusGroups = [
  { key: 'completed', label: 'Completed' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'not_started', label: 'Not Started' }
]

export default function DashboardPage() {
  const learningConfig = INCENTIVE_CONFIG.sections.learning
  const progressFor = (course) => {
    if (course.status === 'completed') return 100
    if (course.status === 'not_started') return 0
    return Math.round((Math.floor(course.modules.length / 2) / course.modules.length) * 100)
  }

  const learningEarned = Math.min(
    learningConfig.max,
    COURSES.reduce((sum, course) => {
      const completedModules = Math.round((progressFor(course) / 100) * course.modules.length)
      return sum + (completedModules * INCENTIVE_CONFIG.learningRate)
    }, 0)
  )

  return <div className="space-y-4">
    <h2 className="text-3xl font-bold">Learning Dashboard</h2>
    <p className="text-gray-400">19 real books with tracked module progress and incentives.</p>

    <CashKpiStrip earned={learningEarned} base={learningConfig.base} accel={learningConfig.accelerator} />

    {statusGroups.map(group => {
      const items = COURSES.filter(course => course.status === group.key)
      return <section key={group.key} className="space-y-2">
        <h3 className="text-xl font-semibold">{group.label} ({items.length})</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {items.map(course => {
            const progress = progressFor(course)
            const completedModules = Math.round((progress / 100) * course.modules.length)
            return <Card key={course.id} className="space-y-2">
              <p className="font-semibold">{course.title}</p>
              <p className="text-sm text-gray-400">{course.author} • {course.publicationDate}</p>
              <p className="text-sm">{course.category}</p>
              <Progress value={progress} />
              <p className="text-sm">Modules: {completedModules}/{course.modules.length}</p>
            </Card>
          })}
        </div>
      </section>
    })}
  </div>
}
