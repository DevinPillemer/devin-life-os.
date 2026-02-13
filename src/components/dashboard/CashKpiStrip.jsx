import { Card } from '@/components/ui/card'

export default function CashKpiStrip({ earned = 120, base = 200, accel = 40 }) {
  return <Card className="grid grid-cols-3 gap-3"><div>Earned ₪{earned}</div><div>Base ₪{base}</div><div>Accelerator ₪{accel}</div></Card>
}
