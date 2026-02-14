import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getIntensityClass(pct) {
  if (pct >= 90) return "bg-emerald-500";
  if (pct >= 70) return "bg-emerald-600";
  if (pct >= 50) return "bg-emerald-700";
  if (pct >= 30) return "bg-emerald-800";
  if (pct > 0) return "bg-emerald-900";
  return "bg-slate-800";
}

export default function WeeklyOverview({ weekData = [] }) {
  // weekData should be array of 7 days: [{date, completed, total, pct}, ...]
  // Fill with defaults if less than 7
  const fullWeek = [...weekData];
  while (fullWeek.length < 7) {
    fullWeek.push({ date: '', completed: 0, total: 0, pct: 0 });
  }
  
  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">This Week</h3>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, i) => {
            const data = fullWeek[i];
            return (
              <div key={day} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-500">{day}</span>
                <div 
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium ${getIntensityClass(data.pct)} ${data.pct > 50 ? 'text-white' : 'text-slate-400'}`}
                >
                  {data.pct > 0 ? `${data.pct}%` : '-'}
                </div>
                <span className="text-[9px] text-slate-600">{data.completed}/{data.total}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
