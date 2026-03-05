import { format } from 'date-fns'
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GOALS } from '@/data/seedData'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const areas = ['Career', 'Family_Life', 'Finance', 'Individual', 'AI_Skills', 'Social_Community']

const areaColors = {
  Career: 'bg-purple-500',
  Family_Life: 'bg-yellow-500',
  Health: 'bg-green-500',
  Learning: 'bg-blue-500',
  Finance: 'bg-emerald-500',
  Individual: 'bg-orange-500',
  AI_Skills: 'bg-cyan-500',
  Social_Community: 'bg-pink-500'
}

const areaAccents = {
  Career: 'border-purple-500/30 from-purple-900/10',
  Family_Life: 'border-yellow-500/30 from-yellow-900/10',
  Finance: 'border-emerald-500/30 from-emerald-900/10',
  Individual: 'border-orange-500/30 from-orange-900/10',
  AI_Skills: 'border-cyan-500/30 from-cyan-900/10',
  Social_Community: 'border-pink-500/30 from-pink-900/10'
}

const priorityStyles = {
  High: 'bg-red-500/20 text-red-200 border border-red-500/30',
  Medium: 'bg-amber-500/20 text-amber-200 border border-amber-500/30',
  Low: 'bg-slate-500/20 text-slate-200 border border-slate-500/30'
}

const gaugeStyles = {
  Deep: 'bg-violet-500/20 text-violet-200 border border-violet-500/30',
  Standard: 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30',
  Quick: 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
}

const notionStatusToLocal = {
  'Done': 'done',
  'In Progress': 'in_progress',
  'Not Started': 'todo'
}

const localToNotionStatus = {
  done: 'Done',
  in_progress: 'In Progress',
  todo: 'Not Started'
}

const readTitle = (property) => property?.title?.[0]?.plain_text || 'Untitled'
const readSelect = (property, fallback = '') => property?.select?.name || fallback
const readDate = property => property?.date?.start || null
const readComment = property => property?.rich_text?.map(item => item?.plain_text).join(' ').trim() || ''

function parseNotionGoal(page, fallbackId) {
  const properties = page?.properties || {}
  return {
    id: page.id || fallbackId,
    title: readTitle(properties.Name),
    area: readSelect(properties.Area, 'Career'),
    status: notionStatusToLocal[readSelect(properties.Status, 'Not Started')] || 'todo',
    priority: readSelect(properties.Priority, 'Medium'),
    gauge: readSelect(properties.Gauge, 'Standard'),
    credits: 10,
    date: readDate(properties.Date),
    comments: readComment(properties.Comments),
    links: properties?.Links?.url || ''
  }
}

function GoalCard({ goal }) {
  return (
    <Card className="border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="font-semibold text-white text-sm leading-snug">{goal.title}</p>
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className={`rounded-full px-2 py-0.5 ${priorityStyles[goal.priority] || priorityStyles.Low}`}>
          {goal.priority || 'Low'}
        </span>
        <span className={`rounded-full px-2 py-0.5 ${gaugeStyles[goal.gauge] || gaugeStyles.Standard}`}>
          {goal.gauge || 'Standard'}
        </span>
      </div>
      {goal.date && (
        <p className="text-xs text-slate-500 mt-2">Due: {format(new Date(goal.date), 'MMM d, yyyy')}</p>
      )}
      {goal.comments && (
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{goal.comments}</p>
      )}
    </Card>
  )
}

export default function GoalsTrackerPage() {
  const [lastSync, setLastSync] = useLocalStorage('notion-goals-last-sync', null)
  const [storedGoals, setStoredGoals] = useLocalStorage('notion-goals-data', null)
  const [syncError, setSyncError] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [collapsedAreas, setCollapsedAreas] = useState({})

  const allGoals = useMemo(() => {
    const source = Array.isArray(storedGoals) && storedGoals.length ? storedGoals : GOALS
    return source.filter(goal => areas.includes(goal.area))
  }, [storedGoals])

  // Only show in_progress goals
  const goals = useMemo(() => allGoals.filter(goal => goal.status === 'in_progress'), [allGoals])

  const inProgressCount = goals.length
  const totalCount = allGoals.length

  const areaProgress = useMemo(() => {
    return areas.reduce((acc, area) => {
      const areaAllGoals = allGoals.filter(goal => goal.area === area)
      const areaInProgress = areaAllGoals.filter(goal => goal.status === 'in_progress').length
      const done = areaAllGoals.filter(goal => goal.status === 'done').length
      const percent = areaAllGoals.length ? Math.round((done / areaAllGoals.length) * 100) : 0
      acc[area] = { total: areaAllGoals.length, done, inProgress: areaInProgress, percent }
      return acc
    }, {})
  }, [allGoals])

  const toggleArea = area => {
    setCollapsedAreas(prev => ({ ...prev, [area]: !prev[area] }))
  }

  const handleSync = async () => {
    setSyncError(null)
    setIsSyncing(true)
    try {
      const response = await fetch('/api/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_size: 100 })
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.message || `Notion sync failed (${response.status})`)
      const parsedGoals = (payload?.results || []).map((result, index) => parseNotionGoal(result, `notion-goal-${index}`))
      setStoredGoals(parsedGoals)
      setLastSync(new Date().toISOString())
    } catch (error) {
      setSyncError(error.message || 'Failed to sync goals from Notion.')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6 rounded-xl bg-slate-950 p-4 text-white">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Goals Tracker</h2>
          <p className="text-sm text-slate-300">
            {inProgressCount} in progress &bull; {totalCount} total goals
          </p>
          <p className="text-xs text-slate-400">
            Last sync: {lastSync ? format(new Date(lastSync), 'PPpp') : 'Never'}
          </p>
        </div>
        <Button onClick={handleSync} disabled={isSyncing} className="gap-2">
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync from Notion'}
        </Button>
      </div>

      {syncError && <p className="text-sm text-red-300">{syncError}</p>}

      {areas.map(area => {
        const areaGoals = goals.filter(goal => goal.area === area)
        if (areaGoals.length === 0) return null
        const isCollapsed = !!collapsedAreas[area]
        const progress = areaProgress[area]
        const accent = areaAccents[area] || 'border-slate-700 from-slate-900/20'

        return (
          <section
            key={area}
            className={`space-y-3 rounded-xl border bg-gradient-to-br ${accent} to-slate-900/60 p-4`}
          >
            <button
              type="button"
              onClick={() => toggleArea(area)}
              className="flex w-full items-center justify-between"
            >
              <div>
                <h3 className="text-left text-base font-semibold text-white">
                  {area.replace(/_/g, ' ')}
                </h3>
                <p className="text-xs text-slate-400">
                  {areaGoals.length} in progress
                  {progress.done > 0 && ` • ${progress.done} done`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full ${areaColors[area] || 'bg-slate-500'} transition-all`}
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">{progress.percent}%</span>
                {isCollapsed ? <ChevronRight size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </div>
            </button>
            {!isCollapsed && (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {areaGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
