import { format } from 'date-fns'
import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HEALTH_DATA, INCENTIVE_CONFIG } from '@/data/seedData'
import { useLocalStorage } from '@/hooks/useLocalStorage'

function parseSheetRows(payload) {
  const rows = payload?.table?.rows || []

  return rows
    .map((row, index) => {
      const cells = row?.c || []
      const weekId = cells[0]?.v || `week-${index + 1}`
      const swims = Number(cells[1]?.v || 0)
      const hiit = Number(cells[2]?.v || 0)
      const incentiveValue = Number(cells[3]?.v || 0)

      if (!weekId) return null
      return { weekId, swims, hiit, incentiveValue }
    })
    .filter(Boolean)
}

export default function HealthPage() {
  const config = INCENTIVE_CONFIG.sections.health
  const [lastSync, setLastSync] = useLocalStorage('health-sheets-last-sync', null)
  const [syncedHealthData, setSyncedHealthData] = useLocalStorage('health-sheets-data', null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)

  const healthRows = Array.isArray(syncedHealthData) && syncedHealthData.length ? syncedHealthData : HEALTH_DATA

  const totals = useMemo(() => {
    return healthRows.reduce((acc, week) => {
      acc.swims += week.swims
      acc.hiit += week.hiit
      acc.incentive += week.incentiveValue
      return acc
    }, { swims: 0, hiit: 0, incentive: 0 })
  }, [healthRows])

  const handleSync = async () => {
    setSyncError(null)
    setIsSyncing(true)

    try {
      const response = await fetch('/api/sheets')
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.message || `Google Sheets sync failed (${response.status})`)
      }

      const parsedRows = parseSheetRows(payload)
      if (!parsedRows.length) {
        throw new Error('Google Sheets returned no rows.')
      }

      setSyncedHealthData(parsedRows)
      setLastSync(new Date().toISOString())
    } catch (error) {
      setSyncError(error.message || 'Failed to sync from Google Sheets.')
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
        {isSyncing ? 'Syncing...' : 'Sync from Google Sheets'}
      </Button>
    </div>

    {syncError && <p className="text-sm text-red-300">{syncError}</p>}

    <div className="grid gap-3 md:grid-cols-3">
      <Card className="border border-slate-800 bg-slate-900/60 p-4"><p className="text-sm text-slate-300">Total swims</p><p className="text-2xl font-semibold">{totals.swims}</p></Card>
      <Card className="border border-slate-800 bg-slate-900/60 p-4"><p className="text-sm text-slate-300">Total HIIT</p><p className="text-2xl font-semibold">{totals.hiit}</p></Card>
      <Card className="border border-slate-800 bg-slate-900/60 p-4"><p className="text-sm text-slate-300">Incentive value</p><p className="text-2xl font-semibold">₪{totals.incentive}</p></Card>
    </div>

    <div className="grid gap-3 md:grid-cols-2">
      {healthRows.map(week => (
        <Card key={week.weekId} className="border border-slate-800 bg-slate-900/60 p-4">
          <p className="font-semibold">{week.weekId}</p>
          <p className="text-slate-300">Swims: {week.swims} • HIIT: {week.hiit}</p>
          <p className="text-slate-300">Incentive value: ₪{week.incentiveValue}</p>
        </Card>
      ))}
    </div>
  </div>
}
