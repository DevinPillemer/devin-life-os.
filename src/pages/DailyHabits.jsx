import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { syncHabitifyData } from "@/functions/syncHabitifyData";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Flame, Wallet, Clock } from "lucide-react";
import { motion } from "framer-motion";

import HabitStatsCards from "@/components/habits/HabitStatsCards";
import TodayHabitsList from "@/components/habits/TodayHabitsList";
import WeeklyOverview from "@/components/habits/WeeklyOverview";
import MonthlyProgress from "@/components/habits/MonthlyProgress";
import MonthlyHeatmap from "@/components/habits/MonthlyHeatmap";
import { WeeklyCompletionsChart, PointsByCategoryChart, StreakLeaderboard } from "@/components/habits/HabitCharts";

const MONTHS = ["Jan-26", "Feb-26", "Mar-26", "Apr-26", "May-26", "Jun-26"];

function getMonthLabel(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(date);
  const year = String(d.getFullYear()).slice(-2);
  return `${months[d.getMonth()]}-${year}`;
}

function getWeekOfMonth(date) {
  const d = new Date(date);
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const dayOfMonth = d.getDate();
  const firstDayOfWeek = firstDay.getDay();
  return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
}

export default function DailyHabits() {
  const [selectedMonth, setSelectedMonth] = useState(() => getMonthLabel(new Date()));
  const [syncData, setSyncData] = useState(null);
  const [habitPoints, setHabitPoints] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  const fetchData = useCallback(async () => {
    const [syncRecords, pointsRecords] = await Promise.all([
      base44.entities.HabitifySync.list('-created_date', 1),
      base44.entities.HabitPoints.filter({ month: selectedMonth })
    ]);
    
    if (syncRecords.length > 0) {
      setSyncData(syncRecords[0]);
      setLastSync(new Date(syncRecords[0].lastSyncDate));
    }
    setHabitPoints(pointsRecords);
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSync = async () => {
    if (isSyncing || cooldown > 0) return;
    setIsSyncing(true);
    
    try {
      const res = await syncHabitifyData({});
      if (res?.data?.error) {
        alert(`Sync error: ${res.data.error}`);
      } else {
        await fetchData();
        setCooldown(30);
        const iv = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) { clearInterval(iv); return 0; }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Calculate stats - handle both array and JSON string for habits
  let habits = syncData?.habits || [];
  if (typeof habits === 'string') {
    try { habits = JSON.parse(habits); } catch { habits = []; }
  }
  let monthlyStats = syncData?.monthlyStats || {};
  if (typeof monthlyStats === 'string') {
    try { monthlyStats = JSON.parse(monthlyStats); } catch { monthlyStats = {}; }
  }
  
  // Check if sync is from today (Israel timezone UTC+3)
  const isSyncFromToday = (() => {
    if (!syncData?.lastSyncDate) return false;
    const syncDate = new Date(syncData.lastSyncDate);
    const now = new Date();
    // Get Israel date strings (UTC+3)
    const israelOffset = 3 * 60; // minutes
    const syncIsrael = new Date(syncDate.getTime() + israelOffset * 60000);
    const nowIsrael = new Date(now.getTime() + israelOffset * 60000);
    return syncIsrael.toISOString().split('T')[0] === nowIsrael.toISOString().split('T')[0];
  })();
  
  const todayCompleted = isSyncFromToday ? habits.filter(h => h.todayStatus === 'completed').length : 0;
  const todayTotal = habits.length;
  
  // If sync is not from today, show all habits as pending
  const displayHabits = isSyncFromToday ? habits : habits.map(h => ({ ...h, todayStatus: 'pending' }));
  
  // Calculate monthly points and reward
  const monthlyPointsEarned = habitPoints.filter(p => p.completed).reduce((sum, p) => sum + p.pointsEarned, 0);
  const dailyMaxPoints = monthlyStats.dailyMaxPoints || habits.reduce((sum, h) => sum + (h.points || 10), 0);
  const daysInMonth = monthlyStats.daysInMonth || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const monthlyPointsTarget = monthlyStats.monthlyTarget || (dailyMaxPoints * daysInMonth) || 5000;
  const monthlyConsistency = monthlyStats.avgConsistency || 0;
  
  // New incentive structure: 200 base + 40 accelerator if >90% consistency
  const monthlyBaseReward = Math.min(200, (monthlyPointsEarned / monthlyPointsTarget) * 200);
  const monthlyAccelerator = monthlyConsistency > 90 ? 40 : 0;
  const monthlyReward = monthlyBaseReward + monthlyAccelerator;
  const monthlyCashMax = 240;

  // Weekly overview data (current week)
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
  
  const weekData = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayPoints = habitPoints.filter(p => p.date === dateStr);
    const completed = dayPoints.filter(p => p.completed).length;
    const total = dayPoints.length || todayTotal;
    weekData.push({
      date: dateStr,
      completed,
      total,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0
    });
  }

  // Monthly heatmap data
  const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayWeekday = (new Date(today.getFullYear(), today.getMonth(), 1).getDay() + 6) % 7; // Monday = 0
  
  const monthHeatmapData = [];
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const d = new Date(today.getFullYear(), today.getMonth(), day);
    const dateStr = d.toISOString().split('T')[0];
    const dayPoints = habitPoints.filter(p => p.date === dateStr);
    const completed = dayPoints.filter(p => p.completed).length;
    const total = dayPoints.length || todayTotal;
    monthHeatmapData.push({
      day,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0,
      weekday: day === 1 ? firstDayWeekday : undefined
    });
  }

  // Weekly completions chart (last 4 weeks)
  const weeklyChartData = [];
  for (let w = 3; w >= 0; w--) {
    const wStart = new Date(weekStart);
    wStart.setDate(wStart.getDate() - (w * 7));
    const wEnd = new Date(wStart);
    wEnd.setDate(wStart.getDate() + 6);
    
    const weekPoints = habitPoints.filter(p => {
      const pDate = new Date(p.date);
      return pDate >= wStart && pDate <= wEnd;
    });
    
    weeklyChartData.push({
      week: `W${4 - w}`,
      completed: weekPoints.filter(p => p.completed).length
    });
  }

  // Points by category
  const categoryPoints = {};
  habitPoints.filter(p => p.completed).forEach(p => {
    const cat = p.areaName || 'General';
    categoryPoints[cat] = (categoryPoints[cat] || 0) + p.pointsEarned;
  });
  const categoryChartData = Object.entries(categoryPoints).map(([category, points]) => ({ category, points }));

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-400" />
              Daily Habits
            </h1>
            <p className="text-sm text-slate-400 mt-1">Powered by Habitify</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-28 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {MONTHS.map(m => (
                  <SelectItem key={m} value={m} className="text-white hover:bg-slate-700">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              {lastSync && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lastSync.toLocaleTimeString()}
                </span>
              )}
              <Button
                onClick={handleSync}
                disabled={isSyncing || cooldown > 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {cooldown > 0 ? `${cooldown}s` : 'Sync Now'}
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <HabitStatsCards
            habitsCount={habits.length}
            todayScore={todayCompleted}
            todayTotal={todayTotal}
            monthlyConsistency={monthlyConsistency}
            monthlyReward={monthlyReward}
          />
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Today's Habits */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TodayHabitsList habits={displayHabits} />
          </motion.div>

          {/* Right Column - Overview & Progress */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <WeeklyOverview weekData={weekData} />
            <MonthlyProgress
              pointsEarned={monthlyPointsEarned}
              pointsTarget={monthlyPointsTarget}
              cashEarned={monthlyBaseReward}
              cashBase={200}
              cashMax={monthlyCashMax}
              acceleratorEarned={monthlyAccelerator}
              consistency={monthlyConsistency}
              monthLabel={selectedMonth}
            />
          </motion.div>
        </div>

        {/* Monthly Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MonthlyHeatmap monthData={monthHeatmapData} monthLabel={selectedMonth} />
        </motion.div>

        {/* Charts Row */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <WeeklyCompletionsChart data={weeklyChartData} />
          <PointsByCategoryChart data={categoryChartData} />
          <StreakLeaderboard habits={habits} />
        </motion.div>

        {/* Wallet Integration Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center gap-3"
        >
          <Wallet className="w-5 h-5 text-emerald-400" />
          <p className="text-sm text-slate-400">
            Habit rewards are automatically added to your wallet weekly (max ₪50/week). 
            Earn up to <span className="text-emerald-400 font-medium">₪200/month</span> base + <span className="text-amber-400 font-medium">₪40 accelerator</span> for &gt;90% consistency.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
