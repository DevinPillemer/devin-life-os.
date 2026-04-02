import { useState } from 'react'
import { Activity, Droplets, Dumbbell, RefreshCw, Loader2, Clock, Flame, TrendingUp, Lightbulb } from 'lucide-react'
import { useApp } from '../context/AppContext'

function ScoreRing({ label, value, max, color, size = 120 }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(value, max) / max) * circumference

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-3)" strokeWidth="8" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            className="ring-animated"
            style={{ '--circumference': circumference, '--offset': offset }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-text">{value}</span>
          <span className="text-[9px] text-text-muted">/{max}</span>
        </div>
      </div>
      <span className="text-sm text-text-muted">{label}</span>
    </div>
  )
}

function ActivityCard({ activity }) {
  const date = new Date(activity.start_date || activity.start_date_local)
  const type = activity.type || activity.sport_type || 'Unknown'
  const isSwim = type.toLowerCase().includes('swim')
  const isWeight = type.toLowerCase().includes('weight') || type.toLowerCase().includes('crossfit')
  const Icon = isSwim ? Droplets : isWeight ? Dumbbell : Activity
  const color = isSwim ? 'var(--accent)' : isWeight ? 'var(--orange)' : 'var(--purple)'

  const duration = activity.moving_time || activity.elapsed_time || 0
  const mins = Math.round(duration / 60)
  const distance = activity.distance ? (activity.distance / 1000).toFixed(1) : null
  const calories = activity.calories || null

  return (
    <div className="flex items-center gap-4 p-4 bg-surface-2 rounded-sm border border-border hover:border-border-hi transition-all">
      <div className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text">{activity.name || type}</p>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-text-muted">
          <span>{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          {mins > 0 && <span className="flex items-center gap-1"><Clock size={10} /> {mins}m</span>}
          {distance && <span>{distance}km</span>}
          {calories && <span className="flex items-center gap-1"><Flame size={10} /> {calories}cal</span>}
        </div>
      </div>
      <div className="text-right">
        <span className="text-xs font-semibold text-gold">₪5</span>
      </div>
    </div>
  )
}

function BmiCalculator() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const bmi = height && weight ? (weight / ((height / 100) ** 2)).toFixed(1) : null
  const getCategory = (b) => {
    if (b < 18.5) return { label: 'Underweight', color: 'text-blue-400' }
    if (b < 25) return { label: 'Normal', color: 'text-green' }
    if (b < 30) return { label: 'Overweight', color: 'text-gold' }
    return { label: 'Obese', color: 'text-red' }
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-5">
      <h3 className="text-[13px] font-semibold mb-4">BMI Calculator</h3>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-text-muted mb-1 block uppercase tracking-wider">Height (cm)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175"
            className="w-full bg-surface-2 border border-border rounded-sm px-3 py-2 text-sm text-text placeholder-text-faint focus:outline-none focus:border-accent/50" />
        </div>
        <div>
          <label className="text-[10px] text-text-muted mb-1 block uppercase tracking-wider">Weight (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70"
            className="w-full bg-surface-2 border border-border rounded-sm px-3 py-2 text-sm text-text placeholder-text-faint focus:outline-none focus:border-accent/50" />
        </div>
        {bmi && (
          <div className="p-3 rounded-sm bg-surface-2 text-center">
            <p className="text-2xl font-bold text-text">{bmi}</p>
            <p className={`text-sm font-medium ${getCategory(parseFloat(bmi)).color}`}>{getCategory(parseFloat(bmi)).label}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HealthDashboardPage() {
  const { strava, fetchStrava, healthWeeks } = useApp()

  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const weeklyData = strava.weeklyHistory.length > 0 ? strava.weeklyHistory : healthWeeks

  // Target: 5 swims + 5 weights per week = 10 sessions
  const weekTarget = 10
  const monthTarget = 40

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Health Dashboard</h1>
          <p className="text-text-muted mt-1">
            Strava activity tracking · ₪5/session
            {strava.lastSynced && <span className="text-text-faint"> · Synced {strava.lastSynced}</span>}
          </p>
        </div>
        <button
          onClick={fetchStrava}
          disabled={strava.loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-medium border border-border bg-surface-2 text-text-muted hover:bg-surface-3 hover:text-text transition-all disabled:opacity-50"
        >
          {strava.loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Sync Strava
        </button>
      </div>

      {strava.error && (
        <div className="bg-red-dim border border-red/20 rounded-sm p-4 text-sm text-red">
          Strava sync failed: {strava.error}
        </div>
      )}

      {/* Score Rings */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
          <ScoreRing label="Swims (week)" value={strava.thisWeek.swims} max={5} color="var(--accent)" />
          <ScoreRing label="Weights (week)" value={strava.thisWeek.weights} max={5} color="var(--orange)" />
          <ScoreRing label="Sessions (month)" value={strava.thisMonth.total} max={monthTarget} color="var(--green)" />
          <ScoreRing label="₪ Earned (month)" value={strava.thisMonth.earned} max={200} color="var(--gold)" />
        </div>
      </div>

      {/* This Week + This Month Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-faint mb-3">This Week</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-accent">{strava.thisWeek.swims}</div>
              <div className="text-[10px] text-text-muted uppercase">Swims</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange">{strava.thisWeek.weights}</div>
              <div className="text-[10px] text-text-muted uppercase">Weights</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gold">₪{strava.thisWeek.earned}</div>
              <div className="text-[10px] text-text-muted uppercase">Earned</div>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-faint mb-3">This Month ({monthLabel})</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-accent">{strava.thisMonth.swims}</div>
              <div className="text-[10px] text-text-muted uppercase">Swims</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange">{strava.thisMonth.weights}</div>
              <div className="text-[10px] text-text-muted uppercase">Weights</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gold">₪{strava.thisMonth.earned}</div>
              <div className="text-[10px] text-text-muted uppercase">Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly History */}
      <div className="bg-surface border border-border rounded-lg p-5">
        <h3 className="text-[13px] font-semibold mb-4">Weekly History</h3>
        <div className="flex flex-col gap-2">
          {weeklyData.map(w => (
            <div key={w.label} className={`grid grid-cols-[80px_1fr_1fr_60px] items-center gap-3 px-4 py-3 rounded-sm border ${
              w.highlight ? 'bg-accent/5 border-accent/20' : 'bg-surface-2 border-border'
            }`}>
              <span className={`text-[11px] font-semibold ${w.highlight ? 'text-accent' : 'text-text-muted'}`}>{w.label}</span>
              <div className="flex items-center gap-2 text-xs">
                <Droplets size={12} className="text-text-faint" /> {w.swims} swims
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Dumbbell size={12} className="text-text-faint" /> {w.weights} weights
              </div>
              <span className="text-xs text-gold font-bold text-right">₪{w.earned}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities + BMI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-[13px] font-semibold mb-4 flex items-center gap-2">
            <Activity size={14} className="text-accent" /> Recent Activities
          </h3>
          {strava.activities.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">
              {strava.loading ? 'Loading activities...' : strava.error ? 'Failed to load — click Sync Strava above' : 'No activities found. Sync Strava to load data.'}
            </p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {strava.activities.slice(0, 15).map((act, i) => (
                <ActivityCard key={act.id || i} activity={act} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {/* Health Tips */}
          <div className="bg-surface border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={14} className="text-gold" />
              <h3 className="text-[13px] font-semibold">Health Tips</h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: '💧', text: 'Drink a glass of water first thing in the morning.' },
                { icon: '🏊', text: 'Swimming burns ~400-700 cal/hour — great for recovery days.' },
                { icon: '💪', text: 'Compound lifts (squat, deadlift, bench) give the most bang for your buck.' },
                { icon: '😴', text: 'Sleep 7-9 hours — it\'s when muscle repair happens.' },
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-sm bg-surface-2">
                  <span className="text-lg">{tip.icon}</span>
                  <p className="text-xs text-text-muted leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>

          <BmiCalculator />
        </div>
      </div>
    </div>
  )
}
