import { format, getISOWeek, getISOWeekYear, startOfMonth } from 'date-fns'
import { Waves, Dumbbell, RefreshCw, Zap, Calendar } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HEALTH_DATA, INCENTIVE_CONFIG } from '@/data/seedData'
import { useLocalStorage } from '@/hooks/useLocalStorage'

function formatDuration(totalSeconds) {
  if (!totalSeconds) return '0m'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours === 0) return `${minutes}m`
  return `${hours}h ${String(minutes).padStart(2, '0')}m`
}

function getCurrentISOWeekId() {
  const now = new Date()
  return `${getISOWeekYear(now)}-W${String(getISOWeek(now)).padStart(2, '0')}`
}

function parseStravaActivities(activities) {
  const weekMap = new Map()
  activities.forEach(activity => {
    const date = activity?.start_date_local ? new Date(activity.start_date_local) : null
    if (!date || Number.isNaN(date.getTime())) return
    const isoYear = getISOWeekYear(date)
    const isoWeek = getISOWeek(date)
    const weekId = `${isoYear}-W${String(isoWeek).padStart(2, '0')}`
    if (!weekMap.has(weekId)) {
      weekMap.set(weekId, { weekId, weekDate: date, swims: 0, weightTraining: 0, totalDistance: 0, totalMovingTime: 0, totalSessions: 0, incentiveValue: 0 })
    }
    const week = weekMap.get(weekId)
    const sportType = activity?.sport_type
    const type = activity?.type
    const isSwim = sportType === 'Swim'
    const isWeightTraining = sportType === 'WeightTraining' || sportType === 'Workout' || type === 'Workout' || type === 'WeightTraining'
    if (isSwim) { week.swims += 1; week.totalDistance += Number(activity?.distance || 0) }
    if (isWeightTraining) { week.weightTraining += 1 }
    week.totalMovingTime += Number(activity?.moving_time || 0)
    week.totalSessions = week.swims + week.weightTraining
    week.incentiveValue = week.totalSessions * INCENTIVE_CONFIG.healthRate
  })
  return Array.from(weekMap.values()).sort((a, b) => b.weekId.localeCompare(a.weekId))
}

function normalizeSeedRows(rows) {
  return rows.map(row => {
    const totalSessions = Number(row?.swims || 0) + Number(row?.hiit || 0)
    return {
      weekId: row.weekId,
      swims: Number(row?.swims || 0),
      weightTraining: Number(row?.hiit || 0),
      totalSessions,
      totalDistance: 0,
      totalMovingTime: 0,
      incentiveValue: Number(row?.incentiveValue ?? totalSessions * INCENTIVE_CONFIG.healthRate)
    }
  })
}

function getWeekStartDate(weekId) {
  // weekId format: 2026-W10
  const [year, weekPart] = weekId.split('-W')
  const week = parseInt(weekPart, 10)
  // Jan 4 is always in week 1
  const jan4 = new Date(parseInt(year, 10), 0, 4)
  const dayOfWeek = jan4.getDay() || 7 // Monday = 1
  const weekStart = new Date(jan4)
  weekStart.setDate(jan4.getDate() - (dayOfWeek - 1) + (week - 1) * 7)
  return weekStart
}

export default function HealthPage() {
  const config = INCENTIVE_CONFIG.sections.health
  const [lastSync, setLastSync] = useLocalStorage('strava-health-last-sync', null)
  const [syncedHealthData, setSyncedHealthData] = useLocalStorage('strava-health-data', null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)

  const healthRows = Array.isArray(syncedHealthData) && syncedHealthData.length
    ? syncedHealthData
    : normalizeSeedRows(HEALTH_DATA)

  const currentWeekId = getCurrentISOWeekId()
  const currentWeek = healthRows.find(w => w.weekId === currentWeekId) || null

  // Monthly stats: only weeks that fall within the current calendar month
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthLabel = format(now, 'MMMM yyyy')

  const monthWeeks = useMemo(() => {
    return healthRows.filter(w => {
      try {
        const ws = getWeekStartDate(w.weekId)
        // Include week if it has any overlap with this month
        // (week starts on or after month start, OR is the current week)
        const weekEnd = new Date(ws); weekEnd.setDate(weekEnd.getDate() + 6); return weekEnd >= monthStart || w.weekId === currentWeekId
      } catch {
        return false
      }
    })
  }, [healthRows, monthStart, currentWeekId])

  const monthTotals = useMemo(() => {
    return monthWeeks.reduce((acc, w) => {
      acc.swims += Number(w.swims || 0)
      acc.weightTraining += Number(w.weightTraining || 0)
      acc.totalSessions += Number(w.totalSessions || 0)
      acc.totalMovingTime += Number(w.totalMovingTime || 0)
      acc.incentive += Number(w.incentiveValue || 0)
      return acc
    }, { swims: 0, weightTraining: 0, totalSessions: 0, totalMovingTime: 0, incentive: 0 })
  }, [monthWeeks])

  const pastWeeks = healthRows.filter(w => w.weekId !== currentWeekId).slice(0, 8)

  const handleSync = async () => {
    setSyncError(null)
    setIsSyncing(true)
    try {
      // Fetch from beginning of current month
      const afterTimestamp = Math.floor(monthStart.getTime() / 1000)
      const response = await fetch(`/api/strava?after=${afterTimestamp}`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.message || `Strava sync failed (${response.status})`)
      if (!Array.isArray(payload)) throw new Error('Strava API returned an invalid response format.')
      const parsedRows = parseStravaActivities(payload)
      // Merge with existing data (keep old weeks, replace/add new ones)
      const existingRows = Array.isArray(syncedHealthData) && syncedHealthData.length ? syncedHealthData : normalizeSeedRows(HEALTH_DATA)
      const merged = [...existingRows]
      parsedRows.forEach(newRow => {
        const idx = merged.findIndex(r => r.weekId === newRow.weekId)
        if (idx >= 0) merged[idx] = newRow
        else merged.push(newRow)
      })
      merged.sort((a, b) => b.weekId.localeCompare(a.weekId))
      setSyncedHealthData(merged)
      setLastSync(new Date().toISOString())
    } catch (error) {
      setSyncError(error.message || 'Failed to sync from Strava.')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-5 p-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Health</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ₪{INCENTIVE_CONFIG.healthRate}/session &bull; {lastSync ? `Synced ${format(new Date(lastSync), 'MMM d, h:mma')}` : 'Not synced'}
          </p>
        </div>
        <Button onClick={handleSync} disabled={isSyncing} size="sm" className="gap-2">
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync Strava'}
        </Button>
      </div>

      {syncError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
          {syncError}
        </div>
      )}

      {/* This Month */}
      <Card className="border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={14} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{monthLabel}</span>
          <span className="ml-auto text-xs text-teal-400 font-semibold">₪{monthTotals.incentive} earned</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Waves size={13} className="text-blue-400" />
              <span className="text-xs text-slate-500">Swims</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{monthTotals.swims}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Dumbbell size={13} className="text-purple-400" />
              <span className="text-xs text-slate-500">Weights</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">{monthTotals.weightTraining}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap size={13} className="text-amber-400" />
              <span className="text-xs text-slate-500">Sessions</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{monthTotals.totalSessions}</p>
          </div>
        </div>
        {monthTotals.totalMovingTime > 0 && (
          <p className="text-center text-xs text-slate-500 mt-3">{formatDuration(monthTotals.totalMovingTime)} total moving time</p>
        )}
      </Card>

      {/* Current Week */}
      {currentWeek ? (
        <Card className="border border-teal-500/20 bg-teal-500/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">This Week</span>
            <span className="text-xs text-teal-300 font-semibold">₪{currentWeek.incentiveValue}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xl font-bold text-blue-400">{currentWeek.swims}</p>
              <p className="text-xs text-slate-500">Swims</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-purple-400">{currentWeek.weightTraining}</p>
              <p className="text-xs text-slate-500">Weights</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-400">{currentWeek.totalSessions}</p>
              <p className="text-xs text-slate-500">Sessions</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border border-slate-800 bg-slate-900/40 p-4 text-center">
          <p className="text-slate-500 text-sm">No activity this week yet</p>
        </Card>
      )}

      {/* Past Weeks */}
      {pastWeeks.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Previous Weeks</p>
          <div className="space-y-2">
            {pastWeeks.map(week => (
              <div key={week.weekId} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
                <span className="text-xs text-slate-500">{week.weekId}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400"><span className="text-blue-400 font-medium">{week.swims}</span> swim</span>
                  <span className="text-xs text-slate-400"><span className="text-purple-400 font-medium">{week.weightTraining}</span> weights</span>
                  <span className="text-xs text-teal-400 font-semibold">₪{week.incentiveValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
