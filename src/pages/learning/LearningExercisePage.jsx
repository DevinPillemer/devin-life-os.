import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import TimerDisplay from '@/components/learning/TimerDisplay'
import { gradeWrittenExercise } from '@/data/learningModule'
import { useLearningEvents } from '@/hooks/useLearningEvents'

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

export default function LearningExercisePage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { trackEvent } = useLearningEvents()
  const courses = read('floopify_courses', [])
  const course = courses.find((item) => item.course.id === courseId)?.course
  const [text, setText] = useState('')
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setElapsed((v) => v + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!course) return <Card className="border-slate-800 bg-slate-900 p-6 text-slate-200">Exercise unavailable.</Card>

  const handleSubmit = () => {
    const result = gradeWrittenExercise(course, text)
    const map = read('floopify_exercise_results', {})
    map[courseId] = result
    localStorage.setItem('floopify_exercise_results', JSON.stringify(map))
    trackEvent('exercise_submitted', { courseId, score: result.scorePercent })
    navigate(`/learning/course/${courseId}/results`)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Card className="border-slate-800 bg-slate-900/80 p-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">Written Exercise</h1>
          <TimerDisplay seconds={elapsed} mode="elapsed" />
        </div>
        <p className="mt-2 text-slate-300">{course.written_exercise.prompt}</p>
        <p className="mt-1 text-sm text-slate-400">Format: {course.written_exercise.deliverable_format} • Timebox: {course.written_exercise.timebox_minutes} min</p>
      </Card>

      <Card className="border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold text-white">Rubric</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          {course.written_exercise.grading_rubric.map((row) => (
            <li key={row.criterion} className="rounded border border-slate-700 bg-slate-900 p-3">
              <p className="font-semibold text-emerald-300">{row.criterion} ({row.points} pts)</p>
              <p className="text-slate-300">{row.what_good_looks_like}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your submission here..."
        className="min-h-72 border-slate-700 bg-slate-950 text-slate-100"
      />

      <Button onClick={handleSubmit} disabled={!text.trim()} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">Submit Exercise</Button>
    </div>
  )
}
