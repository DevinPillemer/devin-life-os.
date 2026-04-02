import { useState } from 'react'
import { Database, Link2, RefreshCw, Check, X, Clock, ArrowUpRight, Loader2, CheckSquare, Target, Heart, DollarSign, BookOpen, Info, Zap } from 'lucide-react'
import { useApp } from '../context/AppContext'

const MODULES = [
  { key: 'habits', label: 'Habits', icon: CheckSquare, color: 'text-accent' },
  { key: 'goals', label: 'Goals', icon: Target, color: 'text-secondary' },
  { key: 'health', label: 'Health', icon: Heart, color: 'text-rose-400' },
  { key: 'transactions', label: 'Transactions', icon: DollarSign, color: 'text-emerald-400' },
  { key: 'learning', label: 'Learning', icon: BookOpen, color: 'text-blue-400' },
]

function StatusBadge({ connected }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
      connected ? 'bg-accent/10 text-accent' : 'bg-white/5 text-gray-500'
    }`}>
      <span className={`w-2 h-2 rounded-full ${connected ? 'bg-accent animate-pulse' : 'bg-gray-600'}`} />
      {connected ? 'Connected' : 'Disconnected'}
    </span>
  )
}

function OnboardingFlow({ onConnect }) {
  return (
    <div className="bg-card rounded-xl border border-border p-8 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
        <Database size={28} className="text-accent" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Connect to Notion</h2>
      <p className="text-gray-400 text-sm mb-6 leading-relaxed">
        Sync your Floopify data with Notion databases. Your habits, goals, health metrics,
        transactions, and learning progress will stay in sync bidirectionally.
      </p>
      <div className="space-y-3 text-left mb-6">
        {[
          'Create a Notion integration at notion.so/my-integrations',
          'Copy your Internal Integration Token',
          'Share your Notion databases with the integration',
          'Paste your token below to connect',
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
            <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
            <p className="text-sm text-gray-300">{step}</p>
          </div>
        ))}
      </div>
      <button onClick={onConnect} className="w-full bg-accent hover:bg-accent/90 text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
        <Link2 size={18} /> Connect with Notion
      </button>
    </div>
  )
}

function DatabaseMapping({ module, databases, selectedDb, onSelect }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
      <div className="flex items-center gap-3">
        <module.icon size={18} className={module.color} />
        <span className="text-sm font-medium text-white">{module.label}</span>
      </div>
      <select
        value={selectedDb || ''}
        onChange={(e) => onSelect(module.key, e.target.value)}
        className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent/50 appearance-none min-w-[180px]"
      >
        <option value="" className="bg-card">Select database...</option>
        {databases.map(db => (
          <option key={db.id} value={db.id} className="bg-card">{db.icon ? `${db.icon} ` : ''}{db.title}</option>
        ))}
      </select>
    </div>
  )
}

function SyncLogEntry({ entry }) {
  const iconMap = {
    success: <Check size={14} className="text-accent" />,
    error: <X size={14} className="text-danger" />,
    info: <Info size={14} className="text-blue-400" />,
  }

  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5">{iconMap[entry.type] || iconMap.info}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300">{entry.message}</p>
        <p className="text-xs text-gray-600 mt-0.5">{entry.timestamp}</p>
      </div>
    </div>
  )
}

export default function NotionSyncPage() {
  const { notion, connectNotion, disconnectNotion, updateDatabaseMapping, syncNow, toggleAutoSync } = useApp()

  const { connected, token, workspace, databases, mappings, lastSynced, syncing, autoSync, syncLog } = notion

  const [tokenInput, setTokenInput] = useState('')
  const [loadingDbs, setLoadingDbs] = useState(false)

  const handleConnect = async () => {
    if (!tokenInput.trim()) return
    setLoadingDbs(true)
    await connectNotion(tokenInput.trim())
    setLoadingDbs(false)
    setTokenInput('')
  }

  const handleOAuthConnect = async () => {
    // Try OAuth flow first
    try {
      const res = await fetch('/api/notion/auth')
      const data = await res.json()
      if (data.authUrl) {
        window.open(data.authUrl, '_blank', 'width=600,height=700')
        return
      }
    } catch {
      // Fall through to token input
    }
  }

  if (!connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notion Sync</h1>
          <p className="text-gray-400 mt-1">Connect Floopify with your Notion workspace</p>
        </div>
        <OnboardingFlow onConnect={handleOAuthConnect} />
        {/* Manual token entry */}
        <div className="bg-card rounded-xl border border-border p-6 max-w-lg mx-auto">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Zap size={14} className="text-warning" /> Quick Connect with API Key
          </h3>
          <div className="flex gap-3">
            <input
              type="password"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              placeholder="Paste your Notion Integration Token..."
              className="flex-1 bg-white/5 border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent/50"
            />
            <button
              onClick={handleConnect}
              disabled={!tokenInput.trim() || loadingDbs}
              className="bg-secondary hover:bg-secondary/90 text-white font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors text-sm disabled:opacity-50"
            >
              {loadingDbs ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
              Connect
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Notion Sync</h1>
          <p className="text-gray-400 mt-1">Manage your Notion integration</p>
        </div>
        <StatusBadge connected={connected} />
      </div>

      {/* Connection Info */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg">
              {workspace?.icon || '📒'}
            </div>
            <div>
              <p className="font-medium text-white">{workspace?.name || 'Notion Workspace'}</p>
              <p className="text-xs text-gray-500">
                {databases.length} database{databases.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
          <button
            onClick={disconnectNotion}
            className="text-xs text-gray-500 hover:text-danger px-3 py-1.5 rounded-lg hover:bg-danger/10 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Database Mapping */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Database size={16} /> Database Mapping
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Select which Notion database maps to each Floopify module
        </p>
        <div className="space-y-2">
          {MODULES.map(mod => (
            <DatabaseMapping
              key={mod.key}
              module={mod}
              databases={databases}
              selectedDb={mappings[mod.key]}
              onSelect={updateDatabaseMapping}
            />
          ))}
        </div>
      </div>

      {/* Sync Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Manual Sync</h3>
          <button
            onClick={syncNow}
            disabled={syncing}
            className="w-full bg-accent hover:bg-accent/90 text-black font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {syncing ? (
              <><Loader2 size={18} className="animate-spin" /> Syncing...</>
            ) : (
              <><RefreshCw size={18} /> Sync Now</>
            )}
          </button>
          {lastSynced && (
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
              <Clock size={12} /> Last synced: {lastSynced}
            </p>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Auto Sync</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Automatic Sync</p>
              <p className="text-xs text-gray-500 mt-0.5">Sync every 15 minutes</p>
            </div>
            <button
              onClick={toggleAutoSync}
              className={`relative w-11 h-6 rounded-full transition-colors ${autoSync ? 'bg-accent' : 'bg-white/10'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${autoSync ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Sync Log */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Clock size={16} /> Sync Log
        </h3>
        {syncLog.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No sync operations yet. Click &quot;Sync Now&quot; to start.</p>
        ) : (
          <div className="divide-y divide-border">
            {syncLog.map((entry, i) => (
              <SyncLogEntry key={i} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
