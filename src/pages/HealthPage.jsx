import { format, getISOWeek, getISOWeekYear } from 'date-fns'
import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HEALTH_DATA, INCENTIVE_CONFIG } from '@/data/seedData'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const DEFAULT_AFTER_SECONDS = 56 * 24 * 60 * 60

function formatDistance(meters) {
  if (!meters) return '0 m'
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${Math.round(meters)} m`
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  return `${hours}h ${String(minutes).padStart(2, '0')}m`
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
      weekMap.set(weekId, {
        weekId,
        weekDate: date,
        swims: 0,
        weightTraining: 0,
        totalDistance: 0,
        totalMovingTime: 0,
        totalSessions: 0,
        incentiveValue: 0
      })
    }

    const week = weekMap.get(weekId)
    const sportType = activity?.sport_type
    const type = activity?.type
    const isSwim = sportType === 'Swim'
    const isWeightTraining = sportType === 'WeightTraining' || sportType === 'Workout' || type === 'Workout' || type === 'WeightTraining'

    if (isSwim) {
      week.swims += 1
      week.totalDistance += Number(activity?.distance || 0)
    }

    if (isWeightTraining) {
      week.weightTraining += 1
    }

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

export default function HealthPage() {
  const config = INCENTIVE_CONFIG.sections.health
  const [lastSync, setLastSync] = useLocalStorage('strava-health-last-sync', null)
  const [syncedHealthData, setSyncedHealthData] = useLocalStorage('strava-health-data', null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)

  const healthRows = Array.isArray(syncedHealthData) && syncedHealthData.length
    ? syncedHealthData
    : normalizeSeedRows(HEALTH_DATA)

  const totals = useMemo(() => {
    return healthRows.reduce((acc, week) => {
      acc.swims += Number(week.swims || 0)
      acc.weightTraining += Number(week.weightTraining || 0)
      acc.totalSessions += Number(week.totalSessions || 0)
      acc.totalDistance += Number(week.totalDistance || 0)
      acc.totalMovingTime += Number(week.totalMovingTime || 0)
      acc.incentive += Number(week.incentiveValue || 0)
      return acc
    }, { swims: 0, weightTraining: 0, totalSessions: 0, totalDistance: 0, totalMovingTime: 0, incentive: 0 })
  }, [healthRows])

  const handleSync = async () => {
    setSyncError(null)
    setIsSyncing(true)

    try {
      const after = Math.floor(Date.now() / 1000) - DEFAULT_AFTER_SECONDS
      const response = await fetch(`/api/strava?after=${after}`)
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.message || `Strava sync failed (${response.status})`)
      }

      if (!Array.isArray(payload)) {
        throw new Error('Strava API returned an invalid response format.')
      }

      const parsedRows = parseStravaActivities(payload)
      setSyncedHealthData(parsedRows)
      setLastSync(new Date().toISOString())
    } catch (error) {
      setSyncError(error.message || 'Failed to sync from Strava.')
    } finally {
      setIsSyncing(false)
    }
  }

  return <div className="space-y-6 rounded-xl bg-slate-950 p-4 text-white">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-bold">Health</h2>
        <p className="text-sm text-slate-300">Health incentive: ₪{INCENTIVE_CONFIG.healthRate} per session • ₪{config.base} base + ₪{config.accelerator} accelerator / month.</p>
        <p className="text-xs text-slate-400">Last sync: {lastSync ? format(new Date(lastSync), 'PPpp') : 'Never'}</p>
      </div>
      <Button onClick={handleSync} disabled={isSyncing} className="gap-2">
        <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
        {isSyncing ? 'Syncing...' : 'Sync from Strava'}
      </Button>
    </div>

    {syncError && <p className="text-sm text-red-300">{syncError}</p>}

    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      <Card className="border border-slate-800 bg-slate-900/60 p-4"><p className="text-sm text-slate-300">Total Swims</p><p className="text-2xl font-semibold">{totals.swims}</p></Card>
      <Card className="border border-slate-800 bg-slate-900/60 p-4"><p className="text-sm text-slate-300">Total Weight Training</p><p className="text-2xl font-semibold">{totals.weightTraining}</p></Card>
      <Card className="border border-slate-800 bg-slate-900/60 p-4"><p className="text-sm text-slate-300">Total Sessions</p><p className="text-2xl font-semibold">{totals.totalSessions}</p></Card>
      <Card className="border border-slate-800 bg-slate-900/60 p-4"><p className="text-sm text-slate-300">Total Swim Distance</p><p className="text-2xl font-semibold">{formatDistance(totals.totalDistance)}</p></Card>
      <Card className="border border-slate-800 bg-slate-900/60 p-4"><p className="text-sm text-slate-300">Total Moving Time</p><p className="text-2xl font-semibold">{formatDuration(totals.totalMovingTime)}</p></Card>
      <Card className="border border-slate-800 bg-slate-900/60 p-4"><p className="text-sm text-slate-300">Total Incentive</p><p className="text-2xl font-semibold">₪{totals.incentive}</p></Card>
    </div>

    <div className="grid gap-3 md:grid-cols-2">
      {healthRows.map(week => (
        <Card key={week.weekId} className="border border-slate-800 bg-slate-900/60 p-4">
          <p className="font-semibold">{week.weekId}</p>
          <p className="text-slate-300">Swims: {week.swims} ({formatDistance(week.totalDistance)})</p>
          <p className="text-slate-300">Weight Training / HIIT: {week.weightTraining}</p>
          <p className="text-slate-300">Total sessions: {week.totalSessions}</p>
          <p className="text-slate-300">Total moving time: {formatDuration(week.totalMovingTime)}</p>
          <p className="text-slate-300">Incentive value: ₪{week.incentiveValue}</p>
        </Card>
      ))}
    </div>
  </div>
}
