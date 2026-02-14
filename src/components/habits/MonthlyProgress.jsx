import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Coins, Target, Zap } from "lucide-react";

export default function MonthlyProgress({ 
  pointsEarned = 0, 
  pointsTarget = 1000, 
  cashEarned = 0,
  cashBase = 200,
  cashMax = 240,
  acceleratorEarned = 0,
  consistency = 0,
  monthLabel = "Feb-26"
}) {
  const pointsPct = pointsTarget > 0 ? Math.min(100, (pointsEarned / pointsTarget) * 100) : 0;
  const basePct = (cashEarned / cashBase) * 100;
  const totalCash = cashEarned + acceleratorEarned;
  const hasAccelerator = acceleratorEarned > 0;
  
  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">Monthly Progress - {monthLabel}</h3>
          <span className="text-xs text-slate-500">Habits Section: ₪200 + ₪40</span>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Target className="w-3 h-3 text-purple-400" />
                Points Earned
              </div>
              <span className="text-sm font-medium text-slate-200">{pointsEarned} / {pointsTarget}</span>
            </div>
            <Progress value={pointsPct} className="h-2 bg-slate-800" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Coins className="w-3 h-3 text-emerald-400" />
                Base Reward
              </div>
              <span className="text-sm font-medium text-emerald-400">₪{cashEarned.toFixed(0)} / ₪{cashBase}</span>
            </div>
            <Progress value={basePct} className="h-2 bg-slate-800" />
          </div>
          
          {/* Accelerator indicator */}
          <div className={`flex items-center justify-between p-2 rounded-lg border ${
            hasAccelerator 
              ? 'bg-amber-950/30 border-amber-700/40' 
              : 'bg-slate-800/30 border-slate-700/40'
          }`}>
            <div className="flex items-center gap-2 text-xs">
              <Zap className={`w-3 h-3 ${hasAccelerator ? 'text-amber-400' : 'text-slate-500'}`} />
              <span className={hasAccelerator ? 'text-amber-300' : 'text-slate-500'}>
                Accelerator ({consistency.toFixed(0)}% consistency)
              </span>
            </div>
            <span className={`text-sm font-medium ${hasAccelerator ? 'text-amber-400' : 'text-slate-500'}`}>
              {hasAccelerator ? '+₪40' : '>90% needed'}
            </span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Section Total</span>
          <span className="text-lg font-bold text-emerald-400">
            ₪{totalCash.toFixed(0)} <span className="text-xs text-slate-500">/ ₪{cashMax}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
