import { useState } from 'react'
import { Plus, ChevronRight, ChevronLeft, Trophy } from 'lucide-react'
import { useApp } from '../context/AppContext'

function ConfettiEffect() {
  const colors = ['#00d4aa', '#7c3aed', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899']
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1 + Math.random() * 1}s`,
            animation: `confetti-fall ${1 + Math.random() * 1}s ease-in ${Math.random() * 0.5}s forwards`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
          }}
        />
      ))}
    </div>
  )
}

function GoalCard({ goal, onMove }) {
  const columns = ['todo', 'in-progress', 'done']
  const currentIdx = columns.indexOf(goal.column)

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-border hover:border-accent/20 transition-all group">
      <h4 className="font-medium text-white text-sm mb-1">{goal.title}</h4>
      <p className="text-xs text-gray-500 mb-3">{goal.description}</p>
      <div className="w-full h-1.5 bg-white/5 rounded-full mb-3">
        <div className="h-full bg-gradient-to-r from-accent to-secondary rounded-full transition-all duration-500" style={{ width: `${goal.progress}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{goal.progress}%</span>
        <div className="flex gap-1">
          {currentIdx > 0 && (
            <button onClick={() => onMove(goal.id, columns[currentIdx - 1])} className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
              <ChevronLeft size={14} />
            </button>
          )}
          {currentIdx < 2 && (
            <button onClick={() => onMove(goal.id, columns[currentIdx + 1])} className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({ title, goals, icon, color, onMove }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 min-h-[300px]">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
        <span className="ml-auto text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{goals.length}</span>
      </div>
      <div className="space-y-3">
        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} onMove={onMove} />
        ))}
      </div>
    </div>
  )
}

export default function GoalsTrackerPage() {
  const { goals, moveGoal, addGoal } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)

  const handleMove = (id, newColumn) => {
    moveGoal(id, newColumn)
    if (newColumn === 'done') {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2000)
    }
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (title.trim()) {
      addGoal(title.trim(), description.trim())
      setTitle('')
      setDescription('')
      setShowForm(false)
    }
  }

  const todoGoals = goals.filter(g => g.column === 'todo')
  const inProgressGoals = goals.filter(g => g.column === 'in-progress')
  const doneGoals = goals.filter(g => g.column === 'done')

  return (
    <div className="space-y-6">
      {showConfetti && <ConfettiEffect />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Goals Tracker</h1>
          <p className="text-gray-400 mt-1">Manage and track your goals</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-accent hover:bg-accent/90 text-black font-medium px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm">
          <Plus size={16} /> Add Goal
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-card rounded-xl border border-border p-5 space-y-3">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Goal title..."
            className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent/50" />
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description..."
            className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent/50" />
          <div className="flex gap-2">
            <button type="submit" className="bg-accent text-black font-medium px-4 py-2 rounded-lg text-sm">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KanbanColumn title="To Do" goals={todoGoals} color="bg-gray-400" onMove={handleMove} />
        <KanbanColumn title="In Progress" goals={inProgressGoals} color="bg-accent" onMove={handleMove} />
        <KanbanColumn title="Done" goals={doneGoals} color="bg-secondary" onMove={handleMove} icon={Trophy} />
      </div>
    </div>
  )
}
