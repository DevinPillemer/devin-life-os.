import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, SkipForward, Flame } from "lucide-react";

const STATUS_CONFIG = {
  completed: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  in_progress: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
  pending: { icon: Clock, color: "text-slate-400", bg: "bg-slate-500/10" },
  failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
  skipped: { icon: SkipForward, color: "text-slate-500", bg: "bg-slate-500/10" }
};

const AREA_COLORS = {
  Health: "bg-emerald-600/20 text-emerald-300 border-emerald-600/30",
  Spiritual: "bg-purple-600/20 text-purple-300 border-purple-600/30",
  Focus: "bg-blue-600/20 text-blue-300 border-blue-600/30",
  Learning: "bg-orange-600/20 text-orange-300 border-orange-600/30",
  Lifestyle: "bg-slate-600/20 text-slate-300 border-slate-600/30",
  General: "bg-slate-600/20 text-slate-300 border-slate-600/30"
};

function getAreaColor(areaName) {
  return AREA_COLORS[areaName] || AREA_COLORS.General;
}

export default function TodayHabitsList({ habits = [] }) {
  const [filter, setFilter] = useState("all");
  
  const filters = [
    { id: "all", label: "All" },
    { id: "completed", label: "Completed" },
    { id: "pending", label: "Pending" },
    { id: "failed", label: "Failed" }
  ];
  
  const filteredHabits = habits.filter(h => {
    if (filter === "all") return true;
    if (filter === "pending") return h.todayStatus === "pending" || h.todayStatus === "in_progress";
    return h.todayStatus === filter;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">Today's Habits</h3>
        <div className="flex gap-1">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === f.id 
                  ? "bg-emerald-600 text-white" 
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        {filteredHabits.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No habits match this filter</div>
        ) : (
          filteredHabits.map(habit => {
            const status = STATUS_CONFIG[habit.todayStatus] || STATUS_CONFIG.pending;
            const StatusIcon = status.icon;
            
            return (
              <Card key={habit.id} className={`border-slate-800 ${status.bg}`}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`w-5 h-5 ${status.color}`} />
                    <div>
                      <div className="text-sm font-medium text-slate-200">{habit.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-[10px] ${getAreaColor(habit.areaName)}`}>
                          {habit.areaName}
                        </Badge>
                        {habit.streak > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-orange-400">
                            <Flame className="w-3 h-3" />
                            {habit.streak}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${habit.todayStatus === 'completed' ? 'text-emerald-400' : 'text-slate-500'}`}>
                      +{habit.points}
                    </div>
                    <div className="text-[10px] text-slate-500">points</div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
