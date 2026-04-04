"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { mockGoals } from "@/lib/mock-data";
import { Target, Filter, ArrowUpDown, Trophy, TrendingUp } from "lucide-react";

const goalCategories = ["All", "Finance", "Learning", "Family Life", "Career", "Health"] as const;
const statusColors: Record<string, string> = {
  "In Progress": "default",
  Completed: "green",
  "Not Started": "muted",
};
const categoryColors: Record<string, string> = {
  Finance: "gold",
  Learning: "blue",
  "Family Life": "pink",
  Career: "purple",
  Health: "green",
};
const progressBarColors: Record<string, string> = {
  Finance: "bg-gold",
  Learning: "bg-blue-500",
  "Family Life": "bg-pink-500",
  Career: "bg-purple-500",
  Health: "bg-emerald-500",
};

type SortKey = "progress" | "creditValue" | "name";

export default function GoalsPage() {
  const [filter, setFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortKey>("progress");

  const filtered = filter === "All" ? mockGoals : mockGoals.filter((g) => g.category === filter);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "progress") return b.progress - a.progress;
    if (sortBy === "creditValue") return b.creditValue - a.creditValue;
    return a.name.localeCompare(b.name);
  });

  const activeCount = mockGoals.filter((g) => g.status === "In Progress").length;
  const completedCount = mockGoals.filter((g) => g.status === "Completed").length;
  const avgProgress = Math.round(mockGoals.reduce((s, g) => s + g.progress, 0) / mockGoals.length);
  const totalCredits = mockGoals.filter((g) => g.status === "Completed").reduce((s, g) => s + g.creditValue, 0);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <Header />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Active Goals</CardTitle>
            <Target className="w-4 h-4 text-accent" />
          </CardHeader>
          <p className="text-3xl font-bold text-accent">{activeCount}</p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
            <Trophy className="w-4 h-4 text-gold" />
          </CardHeader>
          <p className="text-3xl font-bold text-gold">{completedCount}</p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg Progress</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <p className="text-3xl font-bold text-purple-400">{avgProgress}%</p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Credits Earned</CardTitle>
            <Trophy className="w-4 h-4 text-gold" />
          </CardHeader>
          <p className="text-3xl font-bold text-gold">{totalCredits}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Filter className="w-4 h-4 text-text-muted" />
        {goalCategories.map((cat) => (
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
        <div className="ml-auto flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-text-muted" />
          {(["progress", "creditValue", "name"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                sortBy === key ? "bg-accent/15 text-accent" : "text-text-muted hover:text-text-primary"
              }`}
            >
              {key === "creditValue" ? "Credits" : key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((goal) => (
          <Card key={goal.id}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">{goal.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={categoryColors[goal.category] as any}>{goal.category}</Badge>
                  <Badge variant={statusColors[goal.status] as any}>{goal.status}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-text-primary">{goal.progress}%</p>
                <p className="text-xs text-text-muted">{goal.creditValue} credits</p>
              </div>
            </div>
            <ProgressBar
              value={goal.progress}
              color={progressBarColors[goal.category] || "bg-accent"}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
