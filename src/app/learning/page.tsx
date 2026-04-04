"use client";

import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { mockLearningModules } from "@/lib/mock-data";
import { GraduationCap, BookOpen, Flame, Trophy, Clock } from "lucide-react";

const completedModules = mockLearningModules.filter((m) => m.completed);
const inProgressModules = mockLearningModules.filter((m) => !m.completed);
const totalPoints = completedModules.reduce((s, m) => s + m.points, 0);
const currentStreak = 7;

const typeColors: Record<string, string> = {
  Course: "default",
  Book: "purple",
  Article: "blue",
};

const typeIcons: Record<string, string> = {
  Course: "💻",
  Book: "📖",
  Article: "📄",
};

export default function LearningPage() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <Header />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Streak</CardTitle>
            <Flame className="w-4 h-4 text-orange-400" />
          </CardHeader>
          <p className="text-3xl font-bold text-orange-400">{currentStreak} <span className="text-sm font-normal text-text-muted">days</span></p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
            <Trophy className="w-4 h-4 text-gold" />
          </CardHeader>
          <p className="text-3xl font-bold text-gold">{completedModules.length}</p>
          <p className="text-xs text-text-muted mt-1">modules finished</p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
            <Clock className="w-4 h-4 text-accent" />
          </CardHeader>
          <p className="text-3xl font-bold text-accent">{inProgressModules.length}</p>
          <p className="text-xs text-text-muted mt-1">currently active</p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Points Earned</CardTitle>
            <GraduationCap className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <p className="text-3xl font-bold text-blue-400">{totalPoints}</p>
        </Card>
      </div>

      {/* In Progress */}
      <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-accent" />
        Currently Learning
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {inProgressModules.map((mod) => (
          <Card key={mod.id}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{typeIcons[mod.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-text-primary">{mod.title}</h3>
                  <Badge variant={typeColors[mod.type] as any}>{mod.type}</Badge>
                </div>
                <ProgressBar value={mod.progress} showLabel />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-text-muted">{mod.points} points on completion</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Completed */}
      <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-gold" />
        Completed
      </h2>
      <div className="space-y-2">
        {completedModules.map((mod) => (
          <Card key={mod.id} className="flex items-center gap-4 opacity-80">
            <span className="text-xl">{typeIcons[mod.type]}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-text-primary">{mod.title}</h3>
            </div>
            <Badge variant={typeColors[mod.type] as any}>{mod.type}</Badge>
            <span className="text-sm font-medium text-gold">{mod.points}pts</span>
            <span className="text-emerald-400 text-sm">&#10003;</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
