import { Card } from '@/components/ui/card'
import { TrendingUp, Target, Zap } from 'lucide-react'

export default function CashKpiStrip({ earned = 0, base = 200, accel = 0 }) {
  return (
    <Card className="p-4 bg-gray-900/50 border-gray-800">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs text-gray-400">Earned</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">₪{earned}</p>
        </div>
        <div className="space-y-1 border-l border-r border-gray-700">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Target className="w-4 h-4" />
            <span className="text-xs">Base</span>
          </div>
          <p className="text-2xl font-bold text-white">₪{base}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-amber-400">
            <Zap className="w-4 h-4" />
            <span className="text-xs text-gray-400">Accelerator</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">₪{accel}</p>
        </div>
      </div>
    </Card>
  )
}
