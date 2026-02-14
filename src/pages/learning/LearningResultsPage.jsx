import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CertificateCard from '@/components/learning/CertificateCard'
import { issueCertificate } from '@/data/learningModule'
import { useLearningEvents } from '@/hooks/useLearningEvents'

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

export default function LearningResultsPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { trackEvent } = useLearningEvents()
  const courses = read('floopify_courses', [])
  const course = courses.find((item) => item.course.id === courseId)?.course
  const quiz = read('floopify_quiz_results', {})[courseId]
  const exercise = read('floopify_exercise_results', {})[courseId]
  const certificates = read('floopify_certificates', [])

  const certificate = useMemo(() => {
    if (!course || !quiz || !exercise || !quiz.passed) return null
    const existing = certificates.find((item) => item.courseId === courseId)
    if (existing) return existing

    const created = issueCertificate({
      userName: 'Floopify Learner',
      courseTitle: course.title,
      quizScore: quiz.scorePercent,
      courseId
    })
    const next = [...certificates, created]
    localStorage.setItem('floopify_certificates', JSON.stringify(next))
    trackEvent('certificate_issued', { courseId, certificateId: created.id })
    return created
  }, [course, quiz, exercise, certificates, courseId, trackEvent])

  if (!course || !quiz || !exercise) return <Card className="border-slate-800 bg-slate-900 p-6 text-slate-200">Complete quiz and exercise to view results.</Card>

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card className="border-slate-800 bg-slate-900/80 p-6">
        <h1 className="text-3xl font-bold text-white">Results</h1>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ResultBox title="Quiz Score" value={`${quiz.scorePercent}%`} passed={quiz.passed} />
          <ResultBox title="Exercise Score" value={`${exercise.scorePercent}%`} passed={exercise.passed} />
        </div>
      </Card>

      <Card className="border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold text-white">Quiz Breakdown</h2>
        <div className="mt-3 space-y-3">
          {quiz.breakdown.map((item) => (
            <div key={item.qid} className="rounded border border-slate-700 bg-slate-900 p-3">
              <p className="text-sm text-slate-200">{item.prompt}</p>
              <p className={`mt-1 text-xs font-semibold ${item.isCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>{item.isCorrect ? 'Correct' : 'Incorrect'}</p>
              {!item.isCorrect && <p className="text-xs text-slate-400">{item.explanation}</p>}
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold text-white">Exercise Rubric Breakdown</h2>
        <div className="mt-3 space-y-2 text-sm">
          {exercise.rubricBreakdown.map((row) => (
            <p key={row.criterion} className="text-slate-200">{row.criterion}: <span className="text-emerald-300">{row.points}/{row.maxPoints}</span></p>
          ))}
        </div>
        <h3 className="mt-4 font-semibold text-white">Improvement Suggestions</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
          {exercise.suggestions.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </Card>

      {certificate && (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-3 text-center text-emerald-200">🎉 🎉 🎉 Congratulations, certificate unlocked! 🎉 🎉 🎉</div>
          <CertificateCard certificate={certificate} />
          <Button onClick={() => window.print()} className="bg-amber-400 text-slate-950 hover:bg-amber-300">Download Certificate</Button>
        </div>
      )}

      <Button variant="outline" onClick={() => navigate('/learning')}>Back to Library</Button>
    </div>
  )
}

function ResultBox({ title, value, passed }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-1 text-3xl font-bold text-white">{value}</p>
      <p className={`mt-1 text-sm font-semibold ${passed ? 'text-emerald-300' : 'text-amber-300'}`}>{passed ? 'Pass' : 'Needs Improvement'}</p>
    </div>
  )
}
