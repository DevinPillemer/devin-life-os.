"use client";

import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/ui/sparkline";
import { mockActivities, type StravaActivity } from "@/lib/mock-data";
import { Heart, Timer, Ruler, Flame, TrendingUp, Calendar } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const activityIcon: Record<string, string> = {
  Run: "🏃",
  Swim: "🏊",
  Ride: "🚴",
  Walk: "🚶",
  Hike: "🥾",
};

const activityColor: Record<string, string> = {
  Run: "default",
  Swim: "blue",
  Ride: "gold",
  Walk: "green",
  Hike: "purple",
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(1)}km`;
}

// Weekly summary
const totalDistance = mockActivities.reduce((s, a) => s + a.distance, 0);
const totalDuration = mockActivities.reduce((s, a) => s + a.moving_time, 0);
const totalEffort = mockActivities.reduce((s, a) => s + a.suffer_score, 0);

// Effort trend for chart
const effortData = mockActivities
  .slice()
  .reverse()
  .map((a) => ({
    name: new Date(a.start_date).toLocaleDateString("en-IL", { weekday: "short" }),
    effort: a.suffer_score,
    distance: +(a.distance / 1000).toFixed(1),
  }));

// Monthly calendar with activity dots
function generateMonthDays() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const activityDates = new Set(
    mockActivities.map((a) => new Date(a.start_date).getDate())
  );

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, hasActivity: activityDates.has(d) });
  }
  return days;
}

export default function HealthPage() {
  const monthDays = generateMonthDays();

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <Header />

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <Heart className="w-4 h-4 text-red-400" />
          </CardHeader>
          <p className="text-3xl font-bold text-text-primary">{mockActivities.length}</p>
          <p className="text-xs text-text-muted mt-1">this week</p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distance</CardTitle>
            <Ruler className="w-4 h-4 text-accent" />
          </CardHeader>
          <p className="text-3xl font-bold text-accent">{formatDistance(totalDistance)}</p>
          <p className="text-xs text-text-muted mt-1">total</p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Duration</CardTitle>
            <Timer className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <p className="text-3xl font-bold text-blue-400">{formatDuration(totalDuration)}</p>
          <p className="text-xs text-text-muted mt-1">active time</p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Effort</CardTitle>
            <Flame className="w-4 h-4 text-orange-400" />
          </CardHeader>
          <p className="text-3xl font-bold text-orange-400">{totalEffort}</p>
          <p className="text-xs text-text-muted mt-1">relative effort</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Effort Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Effort Trends</CardTitle>
            <TrendingUp className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={effortData}>
                <defs>
                  <linearGradient id="effortGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3040" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #2a3040", borderRadius: "8px" }}
                  labelStyle={{ color: "#e2e8f0" }}
                  itemStyle={{ color: "#14b8a6" }}
                />
                <Area type="monotone" dataKey="effort" stroke="#14b8a6" fill="url(#effortGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>April 2026</CardTitle>
            <Calendar className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-xs text-text-muted py-1">{d}</div>
            ))}
            {monthDays.map((day, i) => (
              <div
                key={i}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-xs mx-auto ${
                  day === null
                    ? ""
                    : day.hasActivity
                    ? "bg-accent/20 text-accent font-medium"
                    : "text-text-muted hover:bg-surface-hover"
                }`}
              >
                {day?.day}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-text-muted">
            <div className="w-3 h-3 rounded-sm bg-accent/20" />
            <span>Activity logged</span>
          </div>
        </Card>
      </div>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 py-3 border-b border-surface-border last:border-0">
              <span className="text-2xl">{activityIcon[activity.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{activity.name}</p>
                <p className="text-xs text-text-muted">
                  {new Date(activity.start_date).toLocaleDateString("en-IL", { weekday: "short", month: "short", day: "numeric" })}
                </p>
              </div>
              <Badge variant={activityColor[activity.type] as any}>{activity.type}</Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary">{formatDistance(activity.distance)}</p>
                <p className="text-xs text-text-muted">{formatDuration(activity.moving_time)}</p>
              </div>
              <div className="text-right w-16">
                <p className="text-sm font-medium text-orange-400">{activity.suffer_score}</p>
                <p className="text-xs text-text-muted">effort</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sleep Placeholder */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sleep Tracking</CardTitle>
          <Badge variant="muted">Coming Soon</Badge>
        </CardHeader>
        <p className="text-sm text-text-muted">
          Garmin sleep data integration coming soon. For now, use manual entry in the habits tracker.
        </p>
      </Card>
    </div>
  );
}
