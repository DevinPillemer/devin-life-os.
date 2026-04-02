import { useState } from 'react'
import { Flame, Plus, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function HabitRow({ habit, onToggle }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:border-accent/20 transition-all duration-200">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onToggle(habit.id)}
          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
            habit.completedToday
              ? 'bg-accent border-accent text-black'
              : 'border-gray-600 hover:border-accent/50'
          }`}
        >
          {habit.completedToday && <Check size={16} strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`font-medium transition-colors ${habit.completedToday ? 'text-gray-400 line-through' : 'text-white'}`}>
            {habit.name}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {habit.streak > 0 && (
              <span className="flex items-center gap-1 text-xs text-orange-400">
                <Flame size={12} /> {habit.streak} day streak 🔥
              </span>
            )}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          {habit.weekHistory.map((done, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-600">{dayLabels[i]}</span>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                done ? 'bg-accent/20 text-accent' : 'bg-white/5 text-gray-600'
              }`}>
                {done ? '✓' : '·'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DailyHabitsPage() {
  const { habits, toggleHabit, addHabit } = useApp()
  const [newHabit, setNewHabit] = useState('')

  const completedCount = habits.filter(h => h.completedToday).length
  const percentage = Math.round((completedCount / habits.length) * 100)

  const handleAdd = (e) => {
    e.preventDefault()
    if (newHabit.trim()) {
      addHabit(newHabit.trim())
      setNewHabit('')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Daily Habits</h1>
        <p className="text-gray-400 mt-1">Track your daily routines and build streaks</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">Today&apos;s Progress</span>
          <span className="text-sm font-bold text-accent">{completedCount}/{habits.length} ({percentage}%)</span>
        </div>
        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-secondary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Add Habit */}
      <form onSubmit={handleAdd} className="flex gap-3">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Add a new habit..."
          className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
        />
        <button
          type="submit"
          className="bg-accent hover:bg-accent/90 text-black font-medium px-5 py-3 rounded-xl flex items-center gap-2 transition-colors text-sm"
        >
          <Plus size={16} /> Add
        </button>
      </form>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.map(habit => (
          <HabitRow key={habit.id} habit={habit} onToggle={toggleHabit} />
        ))}
      </div>
    </div>
  )
}
