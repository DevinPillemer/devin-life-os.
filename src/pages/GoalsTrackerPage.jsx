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

const statusStyles = {
  done: 'bg-green-500/20 text-green-200 border border-green-500/30',
  in_progress: 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30',
  todo: 'bg-slate-500/20 text-slate-200 border border-slate-500/30'
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
    <Card className="space-y-3 border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-white">{goal.title}</p>
        <span className={`rounded-full px-2 py-1 text-xs ${statusStyles[goal.status] || statusStyles.todo}`}>
          {localToNotionStatus[goal.status] || 'Not Started'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`rounded-full px-2 py-1 ${priorityStyles[goal.priority] || priorityStyles.Low}`}>{goal.priority || 'Low'}</span>
        <span className={`rounded-full px-2 py-1 ${gaugeStyles[goal.gauge] || gaugeStyles.Standard}`}>{goal.gauge || 'Standard'}</span>
      </div>

      <div className="space-y-1 text-sm text-slate-300">
        <p>Date: {goal.date ? format(new Date(goal.date), 'PPP') : 'Not set'}</p>
        {goal.comments && <p>Comments: {goal.comments}</p>}
      </div>
    </Card>
  )
}

export default function GoalsTrackerPage() {
  const [lastSync, setLastSync] = useLocalStorage('notion-goals-last-sync', null)
  const [storedGoals, setStoredGoals] = useLocalStorage('notion-goals-data', null)
  const [syncError, setSyncError] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [collapsedAreas, setCollapsedAreas] = useState({})

  const goals = useMemo(() => {
    const source = Array.isArray(storedGoals) && storedGoals.length ? storedGoals : GOALS
    return source.filter(goal => areas.includes(goal.area))
  }, [storedGoals])

  const completed = goals.filter(goal => goal.status === 'done')
  const creditsEarned = completed.reduce((sum, goal) => sum + (goal.credits || 0), 0)

  const areaProgress = useMemo(() => {
    return areas.reduce((acc, area) => {
      const areaGoals = goals.filter(goal => goal.area === area)
      const done = areaGoals.filter(goal => goal.status === 'done').length
      const percent = areaGoals.length ? Math.round((done / areaGoals.length) * 100) : 0
      acc[area] = { total: areaGoals.length, done, percent }
      return acc
    }, {})
  }, [goals])

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
      if (!response.ok) {
        throw new Error(payload?.message || `Notion sync failed (${response.status})`)
      }

      const parsedGoals = (payload?.results || []).map((result, index) => parseNotionGoal(result, `notion-goal-${index}`))
      setStoredGoals(parsedGoals)
      setLastSync(new Date().toISOString())
    } catch (error) {
      setSyncError(error.message || 'Failed to sync goals from Notion.')
    } finally {
      setIsSyncing(false)
    }
  }

  return <div className="space-y-6 rounded-xl bg-slate-950 p-4 text-white">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-bold">Goals Tracker</h2>
        <p className="text-sm text-slate-300">Progress: {completed.length}/{goals.length} • Credits earned: {creditsEarned}</p>
        <p className="text-xs text-slate-400">Last sync: {lastSync ? format(new Date(lastSync), 'PPpp') : 'Never'}</p>
      </div>
      <Button onClick={handleSync} disabled={isSyncing} className="gap-2">
        <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
        {isSyncing ? 'Syncing...' : 'Sync from Notion'}
      </Button>
    </div>

    {syncError && <p className="text-sm text-red-300">{syncError}</p>}

    {areas.map(area => {
      const areaGoals = goals.filter(goal => goal.area === area)
      const isCollapsed = !!collapsedAreas[area]
      const progress = areaProgress[area]

      return (
        <section key={area} className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <button type="button" onClick={() => toggleArea(area)} className="flex w-full items-center justify-between">
            <div>
              <h3 className="text-left text-lg font-semibold">{area.replace('_', ' ')}</h3>
              <p className="text-xs text-slate-400">{progress.done}/{progress.total} completed</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-800">
                <div className={`h-full ${areaColors[area] || 'bg-slate-500'}`} style={{ width: `${progress.percent}%` }} />
              </div>
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
            </div>
          </button>

          {!isCollapsed && (
            <div className="grid gap-3 md:grid-cols-2">
              {areaGoals.length
                ? areaGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)
                : <p className="text-sm text-slate-400">No goals in this area yet.</p>}
            </div>
          )}
        </section>
      )
    })}
  </div>
}
