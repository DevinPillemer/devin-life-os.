import React from "react";
import { Card, CardContent } from "@/components/ui/card";

function getIntensityClass(pct) {
  if (pct >= 90) return "bg-emerald-400";
  if (pct >= 70) return "bg-emerald-500";
  if (pct >= 50) return "bg-emerald-600";
  if (pct >= 30) return "bg-emerald-700";
  if (pct > 0) return "bg-emerald-800";
  return "bg-slate-800";
}

export default function MonthlyHeatmap({ monthData = [], monthLabel = "Feb-26" }) {
  // monthData: [{day: 1, pct: 85}, {day: 2, pct: 100}, ...]
  const weeks = [];
  let currentWeek = [];
  
  // Determine first day of month's weekday (0=Sun, 1=Mon, etc)
  // For simplicity, assume we get the data already structured
  // or we can calculate from month label
  
  // Group days into weeks (7 per row)
  // Add empty slots for days before month starts
  const firstDayOffset = monthData[0]?.weekday || 0; // 0 = Monday
  for (let i = 0; i < firstDayOffset; i++) {
    currentWeek.push(null);
  }
  
  monthData.forEach((day, idx) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }
  
  // If no data, show placeholder
  if (weeks.length === 0) {
    for (let w = 0; w < 5; w++) {
      weeks.push(Array(7).fill(null));
    }
  }
  
  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Monthly Heatmap - {monthLabel}</h3>
        <div className="flex gap-1 mb-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="w-6 text-center text-[9px] text-slate-500">{d}</div>
          ))}
        </div>
        <div className="space-y-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex gap-1">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-6 h-6 rounded-sm flex items-center justify-center text-[8px] ${
                    day ? getIntensityClass(day.pct) : 'bg-slate-900'
                  } ${day && day.pct > 50 ? 'text-white' : 'text-slate-600'}`}
                  title={day ? `Day ${day.day}: ${day.pct}%` : ''}
                >
                  {day?.day || ''}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-1 mt-3">
          <span className="text-[9px] text-slate-500">Less</span>
          {[0, 30, 50, 70, 90].map(pct => (
            <div key={pct} className={`w-3 h-3 rounded-sm ${getIntensityClass(pct)}`} />
          ))}
          <span className="text-[9px] text-slate-500">More</span>
        </div>
      </CardContent>
    </Card>
  );
}
