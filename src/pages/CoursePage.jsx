import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ModulePage from '@/components/course/ModulePage'
import { Button } from '@/components/ui/button'
import { COURSES } from '@/data/seedData'
import { ArrowLeft, BookOpen, CheckCircle } from 'lucide-react'

export default function CoursePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [moduleIndex, setModuleIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Look up course from seed data first
    let found = COURSES.find(c => c.id === id)

    // If not in seed data, check localStorage custom courses
    if (!found) {
      try {
        const stored = localStorage.getItem('customCourses')
        if (stored) {
          const custom = JSON.parse(stored)
          found = custom.find(c => c.id === id)
        }
      } catch (e) {
        console.error('Failed to load custom courses:', e)
      }
    }

    setCourse(found || null)
    setLoading(false)
  }, [id])

  const handleNext = () => {
    if (course && moduleIndex < course.modules.length - 1) {
      setModuleIndex(prev => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    if (moduleIndex > 0) {
      setModuleIndex(prev => prev - 1)
      window.scrollTo(0, 0)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-teal-400 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Course not found</h2>
          <p className="text-slate-400">The course "{id}" could not be found.</p>
          <Button onClick={() => navigate('/dashboard')} className="bg-teal-500 hover:bg-teal-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Course Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-white border-slate-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">{course.title}</h1>
          <p className="text-slate-400">by {course.author}</p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">
            Module {moduleIndex + 1} of {course.modules.length}
          </span>
          <span className="text-sm text-teal-400">
            {Math.round(((moduleIndex + 1) / course.modules.length) * 100)}% complete
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((moduleIndex + 1) / course.modules.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Module Content */}
      <ModulePage
        course={course}
        moduleIndex={moduleIndex}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />

      {/* Completion message */}
      {moduleIndex === course.modules.length - 1 && (
        <div className="mt-6 p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg text-center">
          <CheckCircle className="w-8 h-8 text-teal-400 mx-auto mb-2" />
          <p className="text-teal-400 font-semibold">You've reached the last module!</p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="mt-3 bg-teal-500 hover:bg-teal-600"
          >
            Back to Dashboard
          </Button>
        </div>
      )}
    </div>
  )
}
