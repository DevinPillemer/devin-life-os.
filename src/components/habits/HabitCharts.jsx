import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Flame } from "lucide-react";

export function WeeklyCompletionsChart({ data = [] }) {
  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Weekly Completions (Last 4 Weeks)</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
              <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1f2937", color: "#e5e7eb", fontSize: 12 }}
              />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function PointsByCategoryChart({ data = [] }) {
  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Points by Category</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
              <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis dataKey="category" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={70} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1f2937", color: "#e5e7eb", fontSize: 12 }}
              />
              <Bar dataKey="points" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function StreakLeaderboard({ habits = [] }) {
  const topHabits = [...habits]
    .filter(h => h.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 5);
  
  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          Top Streaks
        </h3>
        {topHabits.length === 0 ? (
          <div className="text-center py-4 text-slate-500 text-sm">No active streaks</div>
        ) : (
          <div className="space-y-2">
            {topHabits.map((habit, i) => (
              <div key={habit.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-500 text-amber-950' : 
                    i === 1 ? 'bg-slate-400 text-slate-900' : 
                    i === 2 ? 'bg-orange-700 text-orange-100' : 
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-300">{habit.name}</span>
                </div>
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame className="w-3 h-3" />
                  <span className="text-sm font-bold">{habit.streak}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
