import { Card } from '@/components/ui/card'
import { HEALTH_DATA, INCENTIVE_CONFIG } from '@/data/seedData'

export default function HealthPage() {
  const config = INCENTIVE_CONFIG.sections.health

  return <div className="space-y-4">
    <h2 className="text-2xl font-bold">Health</h2>
    <p className="text-sm text-gray-300">Health incentive: ₪{INCENTIVE_CONFIG.healthRate} per session • ₪{config.base} base + ₪{config.accelerator} accelerator / month.</p>
    <div className="grid gap-3 md:grid-cols-2">
      {HEALTH_DATA.map(week => (
        <Card key={week.weekId}>
          <p className="font-semibold">{week.weekId}</p>
          <p>Swims: {week.swims} • HIIT: {week.hiit}</p>
          <p>Incentive value: ₪{week.incentiveValue}</p>
        </Card>
      ))}
    </div>
  </div>
}
