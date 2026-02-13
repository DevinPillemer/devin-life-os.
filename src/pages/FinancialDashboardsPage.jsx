import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { INCENTIVE_CONFIG } from '@/data/seedData'

export default function FinancialDashboardsPage() {
  const section = INCENTIVE_CONFIG.sections.finance
  const completedBudgetWeeks = 4
  const earned = Math.min(section.max, completedBudgetWeeks * 50)

  return <div className="space-y-4">
    <h2 className="text-2xl font-bold">Finance Dashboard</h2>
    <Card>
      <p>Incentive config: ₪{section.base} base + ₪{section.accelerator} accelerator per month.</p>
      <p>Budget week rate: ₪50 per completed week.</p>
      <Progress value={(earned / section.base) * 100} />
      <p className="mt-2">Progress: ₪{earned}/₪{section.base}</p>
    </Card>
  </div>
}
