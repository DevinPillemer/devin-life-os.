import { format } from 'date-fns'
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GOALS } from '@/data/seedData'
import { useLocalStorage } from '@/hooks/useLocalStorage'

// All area keys we support (internal format)
const areas = ['Career', 'Hiring', 'Family_Life', 'Finance', 'Individual', 'AI_Skills', 'Social_Community']

// Normalize area names from Notion (may have spaces, slashes) -> internal key
function normalizeArea(raw) {
  if (!raw) return null
  const s = raw.trim()
  // Direct match first
  if (areas.includes(s)) return s
  // Map common Notion variants
  const map = {
    'AI Skills': 'AI_Skills',
    'AI skills': 'AI_Skills',
    'Social / Community': 'Social_Community',
    'Social/Community': 'Social_Community',
    'Social Community': 'Social_Community',
    'Family Life': 'Family_Life',
    'Family_Life': 'Family_Life',
    'Hiring': 'Hiring',
  }
  if (map[s]) return map[s]
  // Fallback: replace spaces and slashes
  const normalized = s.replace(/[\s/]+/g, '_')
  if (areas.includes(normalized)) return normalized
  return s
}

const areaLabels = {
  Career: 'Career',
  Hiring: 'Hiring',
  Family_Life: 'Family Life',
  Finance: 'Finance',
  Individual: 'Individual',
  AI_Skills: 'AI Skills',
  Social_Community: 'Social / Community',
}

const areaAccents = {
  Career:           'border-purple-500/30 from-purple-900/10',
  Hiring:           'border-red-500/30 from-red-900/10',
  Family_Life:      'border-yellow-500/30 from-yellow-900/10',
  Finance:          'border-emerald-500/30 from-emerald-900/10',
  Individual:       'border-orange-500/30 from-orange-900/10',
  AI_Skills:        'border-cyan-500/30 from-cyan-900/10',
  Social_Community: 'border-pink-500/30 from-pink-900/10',
}

const areaDots = {
  Career:           'bg-purple-400',
  Hiring:           'bg-red-400',
  Family_Life:      'bg-yellow-400',
  Finance:          'bg-emerald-400',
  Individual:       'bg-orange-400',
  AI_Skills:        'bg-cyan-400',
  Social_Community: 'bg-pink-400',
}

const priorityStyles = {
  High:   'bg-red-500/20 text-red-200 border border-red-500/30',
  Medium: 'bg-amber-500/20 text-amber-200 border border-amber-500/30',
  Low:    'bg-slate-500/20 text-slate-200 border border-slate-500/30'
}

const gaugeStyles = {
  Deep:     'bg-violet-500/20 text-violet-200 border border-violet-500/30',
  Standard: 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30',
  Quick:    'bg-blue-500/20 text-blue-200 border border-blue-500/30'
}

const notionStatusToLocal = {
  'Done': 'done',
  'In Progress': 'in_progress',
  'Not Started': 'todo'
}

const readTitle = (property) => property?.title?.[0]?.plain_text || 'Untitled'
const readSelect = (property, fallback = '') => property?.select?.name || fallback
const readDate = property => property?.date?.start || null
const readComment = property => property?.rich_text?.map(item => item?.plain_text).join(' ').trim() || ''

function parseNotionGoal(page, fallbackId) {
  const properties = page?.properties || {}
  const rawArea = readSelect(properties.Area, '')
  const area = normalizeArea(rawArea) || 'Individual'
  return {
    id: page.id || fallbackId,
    title: readTitle(properties.Name),
    area,
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
    <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-3 space-y-2">
      <p className="text-sm font-medium text-slate-200 leading-snug">{goal.title}</p>
      <div className="flex flex-wrap gap-1.5">
        <span className={`text-xs rounded-full px-2 py-0.5 ${priorityStyles[goal.priority] || priorityStyles.Medium}`}>
          {goal.priority || 'Medium'}
        </span>
        <span className={`text-xs rounded-full px-2 py-0.5 ${gaugeStyles[goal.gauge] || gaugeStyles.Standard}`}>
          {goal.gauge || 'Standard'}
        </span>
        {goal.date && (
          <span className="text-xs text-slate-500 ml-auto">{format(new Date(goal.date), 'MMM d')}</span>
        )}
      </div>
      {goal.comments && (
        <p className="text-xs text-slate-500 line-clamp-2">{goal.comments}</p>
      )}
    </div>
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
    // Normalize areas on seed data too
    return source.map(g => ({ ...g, area: normalizeArea(g.area) || g.area }))
  }, [storedGoals])

  // Only show in_progress goals
  const goals = useMemo(() => allGoals.filter(goal => goal.status !== 'done'), [allGoals])

  const inProgressCount = goals.length
  const totalCount = allGoals.length

  // Build dynamic area list from actual data (so we don't miss any)
  const dynamicAreas = useMemo(() => {
    const seen = new Set()
    goals.forEach(g => seen.add(g.area))
    // Return in preferred order, then any extras
    const ordered = areas.filter(a => seen.has(a))
    seen.forEach(a => { if (!ordered.includes(a)) ordered.push(a) })
    return ordered
  }, [goals])

  const areaProgress = useMemo(() => {
    return [...areas, ...allGoals.map(g => g.area)].reduce((acc, area) => {
      if (acc[area]) return acc
      const areaAllGoals = allGoals.filter(goal => goal.area === area)
      const done = areaAllGoals.filter(goal => goal.status === 'done').length
      const percent = areaAllGoals.length ? Math.round((done / areaAllGoals.length) * 100) : 0
      acc[area] = { total: areaAllGoals.length, done, inProgress: areaAllGoals.filter(g => g.status === 'in_progress').length, percent }
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
    <div className="space-y-5 p-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Goals</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {inProgressCount} active &bull; {totalCount} total
            {lastSync && <span> &bull; {format(new Date(lastSync), 'MMM d, h:mma')}</span>}
          </p>
        </div>
        <Button onClick={handleSync} disabled={isSyncing} size="sm" className="gap-2">
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync Notion'}
        </Button>
      </div>

      {syncError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
          {syncError}
        </div>
      )}

      {/* Area groups */}
      <div className="space-y-3">
        {dynamicAreas.map(area => {
          const areaGoals = goals.filter(goal => goal.area === area)
          if (areaGoals.length === 0) return null
          const isCollapsed = !!collapsedAreas[area]
          const progress = areaProgress[area] || { total: 0, done: 0, inProgress: 0, percent: 0 }
          const dot = areaDots[area] || 'bg-slate-400'
          const label = areaLabels[area] || area.replace(/_/g, ' ')
          return (
            <Card key={area} className="border border-slate-800 bg-slate-900/60 overflow-hidden">
              <button
                onClick={() => toggleArea(area)}
                className="flex w-full items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${dot}`} />
                  <span className="text-sm font-semibold text-slate-200">{label}</span>
                  <span className="text-xs text-slate-500">{areaGoals.length} active</span>
                </div>
                <div className="flex items-center gap-2">
                  {progress.done > 0 && (
                    <span className="text-xs text-slate-500">{progress.done} done</span>
                  )}
                  {isCollapsed ? <ChevronRight size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                </div>
              </button>
              {!isCollapsed && (
                <div className="px-3 pb-3 grid gap-2 sm:grid-cols-2">
                  {areaGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
