"use client";

import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Sparkline } from "@/components/ui/sparkline";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  mockHabits,
  mockActivities,
  mockGoals,
  mockWallet,
  mockCalendarEvents,
  mockLearningModules,
  mockActivityFeed,
  mockWeeklyTrends,
} from "@/lib/mock-data";
import { Wallet, CheckSquare, Heart, Target, GraduationCap, Clock, Activity, TrendingUp } from "lucide-react";

const totalWallet = mockWallet.reduce((s, w) => s + w.earned, 0);
const habitsCompleted = mockHabits.filter((h) => h.completed).length;
const weekActivities = mockActivities.filter((a) => {
  const d = new Date(a.start_date);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return d >= weekAgo;
}).length;
const activeGoals = mockGoals.filter((g) => g.status === "In Progress").length;
const completedGoals = mockGoals.filter((g) => g.status === "Completed").length;
const learningStreak = 7;

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <Header />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
            <Wallet className="w-4 h-4 text-gold" />
          </CardHeader>
          <p className="text-2xl font-bold text-gold">{formatCurrency(totalWallet)}</p>
          <ProgressBar value={totalWallet} max={1200} color="bg-gold" className="mt-3" />
          <p className="text-xs text-text-muted mt-1">{formatCurrency(totalWallet)} / {formatCurrency(1200)}</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Habits</CardTitle>
            <CheckSquare className="w-4 h-4 text-accent" />
          </CardHeader>
          <p className="text-2xl font-bold text-text-primary">{Math.round((habitsCompleted / mockHabits.length) * 100)}%</p>
          <p className="text-sm text-text-muted mt-1">{habitsCompleted}/{mockHabits.length} completed</p>
          <Sparkline data={mockWeeklyTrends.habits} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health</CardTitle>
            <Heart className="w-4 h-4 text-red-400" />
          </CardHeader>
          <p className="text-2xl font-bold text-text-primary">{weekActivities}</p>
          <p className="text-sm text-text-muted mt-1">sessions this week</p>
          <Sparkline data={mockWeeklyTrends.health} color="#f87171" />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goals</CardTitle>
            <Target className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <p className="text-2xl font-bold text-text-primary">{activeGoals} <span className="text-sm font-normal text-text-muted">active</span></p>
          <p className="text-sm text-text-muted mt-1">{completedGoals} completed</p>
          <Sparkline data={mockWeeklyTrends.goals} color="#a78bfa" />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning</CardTitle>
            <GraduationCap className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <p className="text-2xl font-bold text-text-primary">{learningStreak} day</p>
          <p className="text-sm text-text-muted mt-1">current streak</p>
          <Sparkline data={mockWeeklyTrends.learning} color="#60a5fa" />
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Today&apos;s Calendar</CardTitle>
            <Clock className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <div className="space-y-3">
            {mockCalendarEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3 py-2">
                <div className="w-1 h-10 rounded-full" style={{ backgroundColor: event.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{event.title}</p>
                  <p className="text-xs text-text-muted">{event.start} — {event.end}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Today's Habits */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Today&apos;s Habits</CardTitle>
            <Badge variant="default">{habitsCompleted}/{mockHabits.length}</Badge>
          </CardHeader>
          <div className="space-y-2">
            {mockHabits.map((habit) => (
              <label key={habit.id} className="flex items-center gap-3 py-1.5 cursor-pointer group">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  habit.completed
                    ? "bg-accent border-accent"
                    : "border-surface-border group-hover:border-accent/50"
                }`}>
                  {habit.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm flex-1 ${habit.completed ? "text-text-muted line-through" : "text-text-primary"}`}>
                  {habit.name}
                </span>
                <span className="text-xs text-text-muted">{habit.points}pts</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <Activity className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <div className="space-y-3">
            {mockActivityFeed.map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-1">
                <span className="text-base mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{item.action}</p>
                  <p className="text-xs text-text-muted">{item.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Weekly Trends */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Trends</CardTitle>
            <TrendingUp className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <p className="text-xs text-text-muted mb-2">Health</p>
              <Sparkline data={mockWeeklyTrends.health} color="#f87171" height={50} />
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2">Habits</p>
              <Sparkline data={mockWeeklyTrends.habits} color="#14b8a6" height={50} />
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2">Finance</p>
              <Sparkline data={mockWeeklyTrends.finance} color="#f59e0b" height={50} />
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2">Goals</p>
              <Sparkline data={mockWeeklyTrends.goals} color="#a78bfa" height={50} />
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2">Learning</p>
              <Sparkline data={mockWeeklyTrends.learning} color="#60a5fa" height={50} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
