import { useState } from 'react'
import { Moon, Dumbbell, Apple, Droplets, Lightbulb } from 'lucide-react'

function ScoreRing({ label, score, max, color, icon: Icon, size = 120 }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / max) * circumference

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
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
          <Icon size={20} style={{ color }} />
          <span className="text-lg font-bold text-white mt-1">{score}</span>
        </div>
      </div>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  )
}

function MiniChart({ data, color }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 200
  const h = 50

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 8) - 4
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WeeklyTrend({ label, data, color, unit }) {
  const latest = data[data.length - 1]
  const prev = data[data.length - 2]
  const diff = latest - prev
  const isUp = diff >= 0

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className={`text-xs font-medium ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isUp ? '↑' : '↓'} {Math.abs(diff).toFixed(1)}{unit}
        </span>
      </div>
      <p className="text-xl font-bold text-white mb-2">{latest}{unit}</p>
      <MiniChart data={data} color={color} />
    </div>
  )
}

function HealthTips() {
  const tips = [
    { icon: '💧', text: 'Try to drink a glass of water first thing in the morning.' },
    { icon: '🧘', text: 'Even 5 minutes of stretching can improve your flexibility.' },
    { icon: '😴', text: 'Blue light filters help improve sleep quality.' },
    { icon: '🥗', text: 'Add one extra serving of vegetables to your meals today.' },
  ]

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={18} className="text-warning" />
        <h3 className="text-sm font-semibold text-gray-300">Health Tips</h3>
      </div>
      <div className="space-y-3">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
            <span className="text-lg">{tip.icon}</span>
            <p className="text-sm text-gray-300">{tip.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function BmiCalculator() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  const bmi = height && weight ? (weight / ((height / 100) ** 2)).toFixed(1) : null
  const getCategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' }
    if (bmi < 25) return { label: 'Normal', color: 'text-emerald-400' }
    if (bmi < 30) return { label: 'Overweight', color: 'text-warning' }
    return { label: 'Obese', color: 'text-danger' }
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">BMI Calculator</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Height (cm)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175"
            className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent/50" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Weight (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70"
            className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent/50" />
        </div>
        {bmi && (
          <div className="p-3 rounded-lg bg-white/5 text-center">
            <p className="text-2xl font-bold text-white">{bmi}</p>
            <p className={`text-sm font-medium ${getCategory(parseFloat(bmi)).color}`}>{getCategory(parseFloat(bmi)).label}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HealthDashboardPage() {
  const sleepData = [7.2, 6.8, 7.5, 8.0, 7.1, 6.5, 7.8]
  const exerciseData = [45, 30, 60, 0, 40, 55, 35]
  const caloriesData = [2100, 1900, 2200, 2050, 1800, 2300, 2000]
  const waterData = [6, 8, 7, 5, 8, 6, 7]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Health Dashboard</h1>
        <p className="text-gray-400 mt-1">Monitor your wellness metrics</p>
      </div>

      {/* Score Rings */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
          <ScoreRing label="Sleep" score={78} max={100} color="#818cf8" icon={Moon} />
          <ScoreRing label="Exercise" score={85} max={100} color="#f472b6" icon={Dumbbell} />
          <ScoreRing label="Nutrition" score={72} max={100} color="#34d399" icon={Apple} />
          <ScoreRing label="Hydration" score={90} max={100} color="#38bdf8" icon={Droplets} />
        </div>
      </div>

      {/* Weekly Trends */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <WeeklyTrend label="Avg Sleep" data={sleepData} color="#818cf8" unit="h" />
        <WeeklyTrend label="Exercise" data={exerciseData} color="#f472b6" unit="min" />
        <WeeklyTrend label="Calories" data={caloriesData} color="#34d399" unit="cal" />
        <WeeklyTrend label="Water" data={waterData} color="#38bdf8" unit=" cups" />
      </div>

      {/* Tips + BMI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HealthTips />
        <BmiCalculator />
      </div>
    </div>
  )
}
