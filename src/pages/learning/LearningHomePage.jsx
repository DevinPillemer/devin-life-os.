import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, CheckCircle2, Medal, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SEED_COURSE, getProgressForCourse } from '@/data/learningModule'

const COURSES_KEY = 'floopify_courses'
const SESSIONS_KEY = 'floopify_sessions'
const CERT_KEY = 'floopify_certificates'

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

export default function LearningHomePage() {
  const navigate = useNavigate()
  const [summaryText, setSummaryText] = useState('')
  const [courses, setCourses] = useState(() => read(COURSES_KEY, []))

  const sessions = read(SESSIONS_KEY, {})
  const certificates = read(CERT_KEY, [])

  const stats = useMemo(() => {
    const completed = courses.filter((c) => getProgressForCourse(c.course, sessions[c.course.id]).status === 'completed').length
    return {
      total: courses.length,
      completed,
      certificates: certificates.length
    }
  }, [courses, sessions, certificates.length])

  const generateCourse = () => {
    const existing = read(COURSES_KEY, [])
    const withSeed = existing.some((item) => item.course.id === SEED_COURSE.course.id)
      ? existing
      : [...existing, SEED_COURSE]
    localStorage.setItem(COURSES_KEY, JSON.stringify(withSeed))
    setCourses(withSeed)
    navigate(`/learning/course/${SEED_COURSE.course.id}`)
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <BookOpen className="h-3.5 w-3.5" />
          Floopify Learning Module
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-white">Paste a Blink summary. Get a complete micro-course.</h1>
        <p className="mt-2 text-slate-300">Interactive tutor flow, quiz, written exercise, and certificate — all in one run.</p>
        <div className="mt-5 space-y-3">
          <Textarea
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            placeholder="Paste Blink summary here..."
            className="min-h-36 border-slate-700 bg-slate-950"
          />
          <Button onClick={generateCourse} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
            <Plus className="mr-2 h-4 w-4" />
            Generate Course
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Courses" value={stats.total} icon={BookOpen} />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} />
        <StatCard label="Certificates" value={stats.certificates} icon={Medal} />
      </div>

      <Card className="border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-xl font-bold text-white">Your Courses</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.length === 0 && <p className="text-sm text-slate-400">No courses yet. Generate one from a Blink summary.</p>}
          {courses.map(({ course }) => {
            const progress = getProgressForCourse(course, sessions[course.id])
            const badgeTone = progress.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : progress.status === 'in_progress' ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-700 text-slate-200'
            return (
              <button key={course.id} onClick={() => navigate(`/learning/course/${course.id}`)} className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-left transition hover:border-slate-500">
                <p className="font-semibold text-white">{course.title}</p>
                <p className="mt-1 text-sm text-slate-400">{course.tagline}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badgeTone}`}>{progress.status.replace('_', ' ')}</span>
                  <span className="text-sm text-slate-300">{progress.percent}%</span>
                </div>
              </button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <Card className="border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center gap-2 text-slate-400"><Icon className="h-4 w-4" />{label}</div>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </Card>
  )
}
