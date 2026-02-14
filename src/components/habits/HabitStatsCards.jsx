import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ListChecks, Target, TrendingUp, Coins } from "lucide-react";

function StatCard({ icon: Icon, label, value, subtext, iconColor = "text-emerald-400" }) {
  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          {label}
        </div>
        <div className="text-2xl font-bold text-slate-100">{value}</div>
        {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
      </CardContent>
    </Card>
  );
}

export default function HabitStatsCards({ habitsCount, todayScore, todayTotal, monthlyConsistency, monthlyReward, acceleratorEarned = false }) {
  const todayPct = todayTotal > 0 ? Math.round((todayScore / todayTotal) * 100) : 0;
  const hasAccelerator = monthlyConsistency > 90;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard 
        icon={ListChecks} 
        label="Habits Tracked" 
        value={habitsCount}
        subtext="Active habits"
        iconColor="text-blue-400"
      />
      <StatCard 
        icon={Target} 
        label="Today's Score" 
        value={`${todayScore}/${todayTotal}`}
        subtext={`${todayPct}% complete`}
        iconColor="text-amber-400"
      />
      <StatCard 
        icon={TrendingUp} 
        label="Monthly Consistency" 
        value={`${monthlyConsistency}%`}
        subtext={hasAccelerator ? "Accelerator earned!" : ">90% for +₪40 bonus"}
        iconColor={hasAccelerator ? "text-amber-400" : "text-purple-400"}
      />
      <StatCard 
        icon={Coins} 
        label="Monthly Reward" 
        value={`₪${monthlyReward.toFixed(0)}`}
        subtext="of ₪240 max"
        iconColor="text-emerald-400"
      />
    </div>
  );
}
