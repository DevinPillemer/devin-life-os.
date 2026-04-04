"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { mockHabits, generateHeatmapData, type Habit } from "@/lib/mock-data";
import { Flame, CheckCircle2, BarChart3 } from "lucide-react";

const categories = ["All", "Health", "Spiritual", "Focus", "Learning", "Lifestyle"] as const;
const categoryColors: Record<string, string> = {
  Health: "green",
  Spiritual: "purple",
  Focus: "default",
  Learning: "blue",
  Lifestyle: "gold",
};

function HeatmapCell({ value }: { value: number }) {
  const opacity = value === 0 ? 0.05 : 0.15 + (value / 10) * 0.85;
  return (
    <div
      className="w-3 h-3 rounded-sm"
      style={{ backgroundColor: `rgba(20, 184, 166, ${opacity})` }}
      title={`${value}/10 habits`}
    />
  );
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>(mockHabits);
  const [filter, setFilter] = useState<string>("All");
  const heatmapData = useMemo(() => generateHeatmapData(), []);

  const filtered = filter === "All" ? habits : habits.filter((h) => h.category === filter);
  const completed = habits.filter((h) => h.completed).length;
  const totalPoints = habits.filter((h) => h.completed).reduce((s, h) => s + h.points, 0);
  const maxPoints = habits.reduce((s, h) => s + h.points, 0);

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  // Group heatmap by weeks
  const weeks: { date: string; value: number }[][] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <Header />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Progress</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-accent" />
          </CardHeader>
          <p className="text-3xl font-bold text-text-primary">{completed}<span className="text-lg text-text-muted">/{habits.length}</span></p>
          <ProgressBar value={completed} max={habits.length} className="mt-3" />
          <p className="text-xs text-text-muted mt-2">{Math.round((completed / habits.length) * 100)}% complete</p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Points Earned</CardTitle>
            <Flame className="w-4 h-4 text-gold" />
          </CardHeader>
          <p className="text-3xl font-bold text-gold">{totalPoints}<span className="text-lg text-text-muted">/{maxPoints}</span></p>
          <ProgressBar value={totalPoints} max={maxPoints} color="bg-gold" className="mt-3" />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completion Rates</CardTitle>
            <BarChart3 className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <div className="space-y-2 mt-1">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Daily</span>
              <span className="text-text-primary font-medium">{Math.round((completed / habits.length) * 100)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Weekly</span>
              <span className="text-text-primary font-medium">78%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Monthly</span>
              <span className="text-text-primary font-medium">72%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Heatmap */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>90-Day Habit Heatmap</CardTitle>
        </CardHeader>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <HeatmapCell key={di} value={day.value} />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
          <span>Less</span>
          {[0, 2, 4, 6, 8, 10].map((v) => (
            <HeatmapCell key={v} value={v} />
          ))}
          <span>More</span>
        </div>
      </Card>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === cat
                ? "bg-accent/15 text-accent"
                : "bg-surface text-text-muted hover:text-text-primary hover:bg-surface-hover"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Habits List */}
      <div className="space-y-2">
        {filtered.map((habit) => (
          <Card
            key={habit.id}
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => toggleHabit(habit.id)}
          >
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
              habit.completed
                ? "bg-accent border-accent"
                : "border-surface-border hover:border-accent/50"
            }`}>
              {habit.completed && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${habit.completed ? "text-text-muted line-through" : "text-text-primary"}`}>
                {habit.name}
              </p>
            </div>
            <Badge variant={categoryColors[habit.category] as any}>{habit.category}</Badge>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Flame className="w-3 h-3 text-orange-400" />
              {habit.streak}
            </div>
            <span className="text-sm font-medium text-accent">{habit.points}pts</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
