import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import QuestionCard from '@/components/learning/QuestionCard'
import TimerDisplay from '@/components/learning/TimerDisplay'
import LearningProgressBar from '@/components/learning/ProgressBar'
import { gradeQuiz } from '@/data/learningModule'
import { gradeWithLLM } from '@/services/llmService'
import { useLearningEvents } from '@/hooks/useLearningEvents'

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

export default function LearningQuizPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { trackEvent } = useLearningEvents()
  const courses = read('floopify_courses', [])
  const course = courses.find((item) => item.course.id === courseId)?.course
  const questions = course?.quiz.questions || []
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [remaining, setRemaining] = useState((course?.quiz.time_limit_minutes || 1) * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    trackEvent('quiz_started', { courseId })
  }, [courseId, trackEvent])

  useEffect(() => {
    const timer = setInterval(() => setRemaining((prev) => Math.max(0, prev - 1)), 1000)
    return () => clearInterval(timer)
  }, [])

  const currentQuestion = questions[current]
  const progress = useMemo(() => ((current + 1) / Math.max(1, questions.length)) * 100, [current, questions.length])

  const persistSubmit = async () => {
    if (!course || isSubmitting) return
    setIsSubmitting(true)
    const llmResult = await gradeWithLLM(course, answers, null)
    const result = llmResult.quiz || gradeQuiz(course, answers)
    const map = read('floopify_quiz_results', {})
    map[courseId] = { ...result, source: llmResult.source }
    localStorage.setItem('floopify_quiz_results', JSON.stringify(map))
    trackEvent('quiz_completed', { courseId, score: result.scorePercent, passed: result.passed, source: llmResult.source })
    setIsSubmitting(false)
    navigate(`/learning/course/${courseId}/exercise`)
  }

  useEffect(() => {
    if (remaining === 0 && course) persistSubmit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining])

  if (!course) return <Card className="border-slate-800 bg-slate-900 p-6 text-slate-200">Quiz unavailable.</Card>

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Card className="border-slate-800 bg-slate-900/80 p-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">Course Quiz</h1>
          <TimerDisplay seconds={remaining} mode="countdown" />
        </div>
        <p className="text-sm text-slate-400">Question {current + 1} of {questions.length}</p>
        <div className="mt-3"><LearningProgressBar value={progress} /></div>
      </Card>

      <QuestionCard
        question={currentQuestion}
        initialAnswer={answers[currentQuestion?.qid] || ''}
        onSubmit={(answer) => setAnswers((prev) => ({ ...prev, [currentQuestion.qid]: answer }))}
        submitLabel="Save Answer"
      />

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setCurrent((v) => Math.max(0, v - 1))} disabled={current === 0 || isSubmitting}>Previous</Button>
        {current < questions.length - 1 ? (
          <Button onClick={() => setCurrent((v) => Math.min(questions.length - 1, v + 1))} disabled={isSubmitting} className="bg-sky-500 text-slate-950 hover:bg-sky-400">Next</Button>
        ) : (
          <Button onClick={persistSubmit} disabled={isSubmitting} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Submit Quiz</Button>
        )}
      </div>
    </div>
  )
}
