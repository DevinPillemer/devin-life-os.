import { useState } from 'react'
import { BookOpen, Star, ArrowRight, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import AnimatedCounter from '../components/AnimatedCounter'
import { useApp } from '../context/AppContext'

function CourseCard({ course }) {
  return (
    <Link to={`/learning/${course.id}`} className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-all duration-300 hover:shadow-glow group block">
      <div className="text-4xl mb-3">{course.image}</div>
      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{course.category}</span>
      <h3 className="font-semibold text-white mt-2 mb-1 text-sm group-hover:text-accent transition-colors">{course.title}</h3>
      <p className="text-xs text-gray-500 mb-3">{course.completedLessons}/{course.totalLessons} lessons</p>
      <div className="w-full h-2 bg-white/5 rounded-full mb-2">
        <div className="h-full bg-gradient-to-r from-accent to-secondary rounded-full transition-all duration-500" style={{ width: `${course.progress}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{course.progress}%</span>
        <span className="text-xs text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Continue <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  )
}

export default function LearningHubPage() {
  const { courses } = useApp()
  const [filter, setFilter] = useState('All')
  const totalXp = courses.reduce((sum, c) => sum + c.xp, 0)
  const categories = ['All', 'Development', 'Design', 'Business', 'AI']

  const filtered = filter === 'All' ? courses : courses.filter(c => c.category === filter)

  // Find the course with highest progress that isn't 100%
  const continueFrom = courses.filter(c => c.progress < 100).sort((a, b) => b.progress - a.progress)[0]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Learning Hub</h1>
          <p className="text-gray-400 mt-1">Expand your skills and earn XP</p>
        </div>
        <div className="bg-card rounded-xl border border-border px-5 py-3 flex items-center gap-3">
          <Trophy size={20} className="text-warning" />
          <div>
            <p className="text-xs text-gray-400">Total XP</p>
            <p className="text-lg font-bold text-white"><AnimatedCounter end={totalXp} /></p>
          </div>
        </div>
      </div>

      {/* Continue Learning CTA */}
      {continueFrom && (
        <Link to={`/learning/${continueFrom.id}`} className="block bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl border border-accent/20 p-5 hover:border-accent/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-accent font-medium mb-1">Continue Learning</p>
              <p className="font-semibold text-white">{continueFrom.title}</p>
              <p className="text-sm text-gray-400 mt-1">{continueFrom.progress}% complete • {continueFrom.xp} XP earned</p>
            </div>
            <ArrowRight size={20} className="text-accent" />
          </div>
        </Link>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === cat ? 'bg-accent text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}
