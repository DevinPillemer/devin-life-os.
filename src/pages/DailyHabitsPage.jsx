import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import HabitStatsCards from '@/components/habits/HabitStatsCards'
import TodayHabitsList from '@/components/habits/TodayHabitsList'
import WeeklyOverview from '@/components/habits/WeeklyOverview'
import MonthlyProgress from '@/components/habits/MonthlyProgress'
import HabitCharts from '@/components/habits/HabitCharts'
import MonthlyHeatmap from '@/components/habits/MonthlyHeatmap'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export default function DailyHabitsPage(){
  const [lastSync,setLastSync]=useLocalStorage('habitify-last-sync',null)
  return <div className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Daily Habits</h2><Button onClick={()=>setLastSync(new Date().toISOString())}>Sync Now</Button></div>
  <p className="text-sm text-gray-400">Last sync: {lastSync ? format(new Date(lastSync),'PPpp') : 'Never'} | API key: {import.meta.env.VITE_HABITIFY_API_KEY ? 'configured':'missing'}</p>
  <HabitStatsCards/><TodayHabitsList/><WeeklyOverview/><MonthlyProgress/><HabitCharts/><MonthlyHeatmap/></div>
}
