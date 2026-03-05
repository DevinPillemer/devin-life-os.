import { format, getISOWeek, getISOWeekYear } from 'date-fns'
import { Activity, Dumbbell, Waves, Clock, RefreshCw, TrendingUp, Zap } from 'lucide-react'
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

function getCurrentISOWeekId() {
  const now = new Date()
  const isoYear = getISOWeekYear(now)
  const isoWeek = getISOWeek(now)
  return `${isoYear}-W${String(isoWeek).padStart(2, '0')}`
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

function StatCard({ icon: Icon, label, value, color = 'text-teal-400', sub }) {
  return (
    <Card className="border border-slate-800 bg-slate-900/60 p-5 flex flex-col gap-1">
      <div className="flex items-center justify-between text-slate-400 mb-1">
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        <Icon size={16} className={color} />
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </Card>
  )
}

function CurrentWeekCard({ week }) {
  const currentWeekId = getCurrentISOWeekId()
  const isCurrentWeek = week?.weekId === currentWeekId

  if (!week) {
    return (
      <Card className="border border-teal-500/40 bg-gradient-to-br from-teal-900/20 to-slate-900/60 p-6">
        <p className="text-slate-400 text-sm">No data for current week yet.</p>
      </Card>
    )
  }

  return (
    <Card className="border border-teal-500/40 bg-gradient-to-br from-teal-900/20 to-slate-900/60 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-teal-400" />
            <h3 className="text-lg font-bold text-white">
              {isCurrentWeek ? 'This Week' : week.weekId}
            </h3>
            {isCurrentWeek && (
              <span className="text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full px-2 py-0.5">Live</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{week.weekId}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-teal-400">\u20aa{week.incentiveValue}</p>
          <p className="text-xs text-slate-400">incentive earned</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 rounded-xl p-4 text-center">
          <Waves size={22} className="text-blue-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-blue-400">{week.swims}</p>
          <p className="text-xs text-slate-400 mt-1">Swims</p>
          {week.totalDistance > 0 && <p className="text-xs text-slate-500">{formatDistance(week.totalDistance)}</p>}
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4 text-center">
          <Dumbbell size={22} className="text-purple-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-purple-400">{week.weightTraining}</p>
          <p className="text-xs text-slate-400 mt-1">Weight / HIIT</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4 text-center">
          <Activity size={22} className="text-green-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-green-400">{week.totalSessions}</p>
          <p className="text-xs text-slate-400 mt-1">Total Sessions</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4 text-center">
          <Clock size={22} className="text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-400">{formatDuration(week.totalMovingTime)}</p>
          <p className="text-xs text-slate-400 mt-1">Moving Time</p>
        </div>
      </div>
    </Card>
  )
}

function WeekRow({ week }) {
  return (
    <Card className="border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-white text-sm">{week.weekId}</p>
        <span className="text-sm font-bold text-teal-400">\u20aa{week.incentiveValue}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-xl font-bold text-blue-400">{week.swims}</p>
          <p className="text-xs text-slate-500">Swims</p>
          {week.totalDistance > 0 && <p className="text-xs text-slate-600">{formatDistance(week.totalDistance)}</p>}
        </div>
        <div>
          <p className="text-xl font-bold text-purple-400">{week.weightTraining}</p>
          <p className="text-xs text-slate-500">Weights</p>
        </div>
        <div>
          <p className="text-xl font-bold text-green-400">{week.totalSessions}</p>
          <p className="text-xs text-slate-500">Sessions</p>
        </div>
        <div>
          <p className="text-base font-bold text-amber-400">{formatDuration(week.totalMovingTime)}</p>
          <p className="text-xs text-slate-500">Time</p>
        </div>
      </div>
    </Card>
  )
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
  const currentWeek = healthRows.find(w => w.weekId === currentWeekId) || healthRows[0]
  const pastWeeks = healthRows.filter(w => w.weekId !== currentWeek?.weekId)

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
      if (!response.ok) throw new Error(payload?.message || `Strava sync failed (${response.status})`)
      if (!Array.isArray(payload)) throw new Error('Strava API returned an invalid response format.')
      const parsedRows = parseStravaActivities(payload)
      setSyncedHealthData(parsedRows)
      setLastSync(new Date().toISOString())
    } catch (error) {
      setSyncError(error.message || 'Failed to sync from Strava.')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6 rounded-xl bg-slate-950 p-4 text-white">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Health</h2>
          <p className="text-sm text-slate-300">
            \u20aa{INCENTIVE_CONFIG.healthRate} per session &bull; \u20aa{config.base} base + \u20aa{config.accelerator} accelerator / month
          </p>
          <p className="text-xs text-slate-400">
            Last sync: {lastSync ? format(new Date(lastSync), 'PPpp') : 'Never'}
          </p>
        </div>
        <Button onClick={handleSync} disabled={isSyncing} className="gap-2">
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync from Strava'}
        </Button>
      </div>

      {syncError && <p className="text-sm text-red-300">{syncError}</p>}

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Waves} label="Total Swims" value={totals.swims} color="text-blue-400" />
        <StatCard icon={Dumbbell} label="Weight Training" value={totals.weightTraining} color="text-purple-400" />
        <StatCard icon={Activity} label="Total Sessions" value={totals.totalSessions} color="text-green-400" />
        <StatCard icon={TrendingUp} label="Swim Distance" value={formatDistance(totals.totalDistance)} color="text-cyan-400" />
        <StatCard icon={Clock} label="Moving Time" value={formatDuration(totals.totalMovingTime)} color="text-amber-400" />
        <StatCard icon={Zap} label="Total Incentive" value={`\u20aa${totals.incentive}`} color="text-teal-400" />
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Current Week</h3>
        <CurrentWeekCard week={currentWeek} />
      </div>

      {pastWeeks.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Previous Weeks</h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {pastWeeks.map(week => (
              <WeekRow key={week.weekId} week={week} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
