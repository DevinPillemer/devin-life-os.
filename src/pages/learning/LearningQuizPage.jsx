import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Loader2, UserRound } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { gradeQuiz } from '@/data/learningModule'
import { gradeWithLLM } from '@/services/llmService'
import { useLearningEvents } from '@/hooks/useLearningEvents'

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

const FALLBACK_QUIZ = {
  pass_score_percent: 70,
  time_limit_minutes: 6,
  questions: [
    {
      qid: 'AIJ-1',
      format: 'mcq',
      prompt: "What is the main concern of the 'This Time It's Different' camp regarding AI?",
      choices: [
        'AI is just another tool like those before it.',
        'AI is fundamentally different and replicates human skills directly.',
        'AI will lead to mass job creation as previous technologies did.',
        'AI will only enhance existing jobs.'
      ],
      answer_key: 'AI is fundamentally different and replicates human skills directly.',
      explanation: "The concern is that AI can replicate core cognitive skills directly, not just support existing workflows."
    },
    {
      qid: 'AIJ-2',
      format: 'mcq',
      prompt: "Which three revolutions combine to make today's AI wave uniquely powerful?",
      choices: [
        'Data at scale, cheap cloud compute, and model breakthroughs.',
        'Robotics, IoT, and blockchain convergence.',
        'Social media, mobile, and cloud adoption.',
        'Big data, automation, and digital transformation.'
      ],
      answer_key: 'Data at scale, cheap cloud compute, and model breakthroughs.',
      explanation: 'Those three factors unlock AI capabilities at speed and scale across industries.'
    },
    {
      qid: 'AIJ-3',
      format: 'mcq',
      prompt: "What does the 'automate, augment, anchor' framework help leaders do?",
      choices: [
        'Classify tasks to decide where AI generates, humans decide, and both collaborate.',
        'Replace all human roles with autonomous systems.',
        'Measure ROI on AI investments only.',
        'Standardize software procurement processes.'
      ],
      answer_key: 'Classify tasks to decide where AI generates, humans decide, and both collaborate.',
      explanation: 'The framework separates where automation fits, where collaboration helps, and where human judgment must anchor outcomes.'
    },
    {
      qid: 'AIJ-4',
      format: 'mcq',
      prompt: "Why does AI's impact look different across industries?",
      choices: [
        'Because each industry has a different number of employees.',
        'Because industry structure, regulation, data availability, and risk tolerance all vary.',
        'Because AI tools are licensed differently per sector.',
        'Because only some industries have adopted cloud computing.'
      ],
      answer_key: 'Because industry structure, regulation, data availability, and risk tolerance all vary.',
      explanation: 'Industry conditions and constraints shape both adoption speed and practical AI use cases.'
    },
    {
      qid: 'AIJ-5',
      format: 'mcq',
      prompt: "What is the first step to 'preparing to be supercharged' by AI?",
      choices: [
        'Replacing your team with AI agents immediately.',
        'Achieving AI literacy—understanding how models behave, fail, and can be prompted.',
        'Signing up for every AI SaaS product available.',
        'Outsourcing all repetitive tasks to offshore teams.'
      ],
      answer_key: 'Achieving AI literacy—understanding how models behave, fail, and can be prompted.',
      explanation: 'Literacy is foundational because it helps teams use AI responsibly, effectively, and with better judgment.'
    },
    {
      qid: 'AIJ-6',
      format: 'mcq',
      prompt: 'According to the final summary, what is the long-term edge for professionals?',
      choices: [
        'Memorizing the largest number of AI tools.',
        'Pairing technical fluency with domain judgment.',
        'Avoiding AI to preserve uniquely human value.',
        'Focusing exclusively on management roles.'
      ],
      answer_key: 'Pairing technical fluency with domain judgment.',
      explanation: 'Technical fluency plus domain judgment creates durable advantage in AI-enabled work.'
    }
  ]
}

export default function LearningQuizPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { trackEvent } = useLearningEvents()
  const courses = read('floopify_courses', [])
  const selected = courses.find((item) => item.course.id === courseId)?.course
  const course = selected ? { ...selected, quiz: selected.quiz?.questions?.length ? selected.quiz : FALLBACK_QUIZ } : null
  const questions = course?.quiz?.questions || FALLBACK_QUIZ.questions
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [remaining, setRemaining] = useState((course?.quiz?.time_limit_minutes || FALLBACK_QUIZ.time_limit_minutes) * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    trackEvent('quiz_started', { courseId })
  }, [courseId, trackEvent])

  useEffect(() => {
    if (result) return undefined
    const timer = setInterval(() => setRemaining((prev) => Math.max(0, prev - 1)), 1000)
    return () => clearInterval(timer)
  }, [result])

  const currentQuestion = questions[current]
  const answeredCount = Object.values(answers).filter(Boolean).length
  const progress = useMemo(() => ((current + 1) / Math.max(1, questions.length)) * 100, [current, questions.length])

  const persistSubmit = async () => {
    if (isSubmitting || result) return
    setIsSubmitting(true)

    let scored
    let source = 'local'

    if (course) {
      const llmResult = await gradeWithLLM(course, answers, null)
      scored = llmResult.quiz || gradeQuiz(course, answers)
      source = llmResult.source
    } else {
      const breakdown = FALLBACK_QUIZ.questions.map((question) => {
        const userAnswer = answers?.[question.qid] || ''
        return {
          qid: question.qid,
          prompt: question.prompt,
          userAnswer,
          answerKey: question.answer_key,
          isCorrect: userAnswer === question.answer_key,
          explanation: question.explanation
        }
      })
      const correct = breakdown.filter((item) => item.isCorrect).length
      const total = FALLBACK_QUIZ.questions.length
      const scorePercent = Math.round((correct / total) * 100)
      scored = {
        scorePercent,
        passed: scorePercent >= FALLBACK_QUIZ.pass_score_percent,
        correct,
        total,
        breakdown,
        submittedAt: new Date().toISOString()
      }
    }

    const map = read('floopify_quiz_results', {})
    map[courseId] = { ...scored, source }
    localStorage.setItem('floopify_quiz_results', JSON.stringify(map))
    trackEvent('quiz_completed', { courseId, score: scored.scorePercent, passed: scored.passed, source })
    setResult(scored)
    setIsSubmitting(false)
  }

  useEffect(() => {
    if (remaining === 0 && !result) persistSubmit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, result])

  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

 

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-3xl border border-slate-800 bg-[#0f1117] p-5 text-slate-200 md:p-8">
      <div className="mb-6 space-y-3">
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
          <p>Question {Math.min(current + 1, questions.length)} of {questions.length} • {answeredCount}/{questions.length} answered</p>
          <p className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 font-medium text-slate-200">{formatTime(remaining)}</p>
        </div>
      </div>

      {!result ? (
        <>
          <Card className="relative border-slate-800 bg-slate-950/80 p-6">
            <span className="absolute right-5 top-5 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
              Multiple Choice
            </span>
            <div className="mb-5 flex items-center gap-2 text-sm uppercase tracking-[0.14em] text-slate-400">
              <UserRound className="h-4 w-4" />
              <span>Question {current + 1} of {questions.length}</span>
            </div>
            <h2 className="max-w-3xl text-xl font-semibold leading-relaxed text-slate-100">{currentQuestion?.prompt}</h2>

            <div className="mt-6 space-y-3">
              {(currentQuestion?.choices || []).map((choice) => {
                const checked = answers[currentQuestion.qid] === choice
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.qid]: choice }))}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${checked ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100' : 'border-slate-700 bg-[#1a1f2e] text-slate-200 hover:border-slate-500 hover:bg-slate-800/80'}`}
                  >
                    <span className={`h-4 w-4 rounded-full border ${checked ? 'border-emerald-300 bg-emerald-300 ring-2 ring-emerald-400/40' : 'border-slate-500'}`} />
                    <span>{choice}</span>
                  </button>
                )
              })}
            </div>
          </Card>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setCurrent((v) => Math.max(0, v - 1))} disabled={current === 0 || isSubmitting}>
              Previous
            </Button>
            {current < questions.length - 1 ? (
              <Button onClick={() => setCurrent((v) => Math.min(questions.length - 1, v + 1))} disabled={isSubmitting} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">Next</Button>
            ) : (
              <Button onClick={persistSubmit} disabled={isSubmitting} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit Quiz
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.14em] text-slate-400">Quiz results</p>
            <h2 className="mt-2 text-3xl font-bold text-white">{result.scorePercent}%</h2>
            <p className={`mt-2 text-lg font-semibold ${result.passed ? 'text-emerald-300' : 'text-rose-300'}`}>
              {result.passed ? 'Passed' : 'Not Passed'} · {result.correct}/{result.total} correct
            </p>
            <Link to={`/learning/course/${courseId}`} className="mt-4 inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200">
              Back to Course
            </Link>
          </Card>

          <div className="space-y-3">
            {result.breakdown.map((item, index) => (
              <Card key={item.qid} className={`border p-4 ${item.isCorrect ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-rose-400/40 bg-rose-500/10'}`}>
                <p className="text-sm text-slate-300">Question {index + 1}</p>
                <p className="mt-1 font-medium text-slate-100">{item.prompt}</p>
                <p className="mt-2 text-sm text-slate-200">Your answer: {item.userAnswer || 'No answer'}</p>
                <p className="mt-1 text-sm text-emerald-200">Correct answer: {item.answerKey}</p>
                {item.isCorrect ? <CheckCircle2 className="mt-2 h-4 w-4 text-emerald-300" /> : null}
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={() => navigate('/learning/modules')} className="border-slate-600 bg-slate-900/80 text-slate-100 hover:bg-slate-800">
          Back to Modules
        </Button>
        <p className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
          Question {Math.min(current + 1, questions.length)} / {questions.length}
        </p>
      </div>
    </div>
  )
}
