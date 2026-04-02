import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Check, Clock, BookOpen } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function CourseDetailPage() {
  const { id } = useParams()
  const { courses } = useApp()
  const course = courses.find(c => c.id === parseInt(id))

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Course not found</p>
        <Link to="/learning" className="text-accent hover:underline mt-2 inline-block">Back to Learning Hub</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link to="/learning" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
        <ArrowLeft size={16} /> Back to Learning Hub
      </Link>

      {/* Header */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl">{course.image}</div>
          <div className="flex-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{course.category}</span>
            <h1 className="text-xl font-bold text-white mt-2">{course.title}</h1>
            <p className="text-sm text-gray-400 mt-1">{course.completedLessons}/{course.totalLessons} lessons completed • {course.xp} XP earned</p>
            <div className="w-full h-2 bg-white/5 rounded-full mt-3">
              <div className="h-full bg-gradient-to-r from-accent to-secondary rounded-full transition-all" style={{ width: `${course.progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <BookOpen size={16} /> Lessons
        </h2>
        <div className="space-y-2">
          {course.lessons.map((lesson, i) => (
            <div key={lesson.id} className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${lesson.completed ? 'bg-accent/5' : 'bg-white/5 hover:bg-white/[0.07]'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                lesson.completed ? 'bg-accent text-black' : 'bg-white/10 text-gray-500'
              }`}>
                {lesson.completed ? <Check size={14} strokeWidth={3} /> : <span className="text-xs font-medium">{i + 1}</span>}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${lesson.completed ? 'text-gray-400' : 'text-white'}`}>{lesson.title}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                {lesson.duration}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
