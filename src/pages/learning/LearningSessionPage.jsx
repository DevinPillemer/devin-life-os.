import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ContentBlock from '@/components/learning/ContentBlock'
import QuestionCard from '@/components/learning/QuestionCard'
import FeedbackCard from '@/components/learning/FeedbackCard'
import LearningProgressBar from '@/components/learning/ProgressBar'
import { getNextQuestion, gradeAnswer } from '@/data/learningModule'
import { evaluateAnswer } from '@/services/llmService'
import { useLearningEvents } from '@/hooks/useLearningEvents'

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

const createInitialSession = (courseId) => ({
  courseId,
  startedAt: new Date().toISOString(),
  completedAt: null,
  currentChapterIndex: 0,
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  wrongStreak: 0,
  completedSections: [],
  completedChapters: [],
  answers: []
})

export default function LearningSessionPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { trackEvent } = useLearningEvents()
  const courses = read('floopify_courses', [])
  const selected = courses.find((item) => item.course.id === courseId)?.course
  const sessions = read('floopify_sessions', {})

  const existingSession = sessions[courseId] || createInitialSession(courseId)
  if (!sessions[courseId]) {
    sessions[courseId] = existingSession
    localStorage.setItem('floopify_sessions', JSON.stringify(sessions))
    trackEvent('session_started', { courseId })
  }

  const [session, setSession] = useState(existingSession)
  const [feedback, setFeedback] = useState(null)
  const [showRemediation, setShowRemediation] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const chapter = selected?.course_outline[session.currentChapterIndex]
  const section = chapter?.sections[session.currentSectionIndex]
  const question = selected ? getNextQuestion(selected, session) : null

  const flatSections = useMemo(() => selected ? selected.course_outline.flatMap((c) => c.sections) : [], [selected])
  const sectionPosition = Math.min(flatSections.length, flatSections.findIndex((s) => s.section_id === section?.section_id) + 1)

  if (!selected || !section) return <Card className="border-slate-800 bg-slate-900 p-6 text-slate-200">Session unavailable. Return to library.</Card>

  const persistSession = (next) => {
    const all = read('floopify_sessions', {})
    all[courseId] = next
    localStorage.setItem('floopify_sessions', JSON.stringify(all))
    setSession(next)
  }

  const handleSubmitAnswer = async (userAnswer) => {
    if (!question) return
    setIsEvaluating(true)
    const llmResult = await evaluateAnswer(selected, session, userAnswer)
    const localResult = gradeAnswer(question, userAnswer)
    const result = {
      ...localResult,
      isCorrect: llmResult?.evaluation?.is_correct ?? localResult.isCorrect,
      feedback: llmResult?.evaluation?.feedback || localResult.feedback,
      bullets: llmResult?.evaluation?.rationale_bullets || localResult.bullets
    }

    setFeedback(result)
    trackEvent('question_answered', { courseId, questionId: question.question_id, isCorrect: result.isCorrect, evaluationSource: llmResult?.source || 'local' })

    const updated = {
      ...session,
      wrongStreak: result.isCorrect ? 0 : session.wrongStreak + 1,
      answers: [
        ...session.answers,
        { questionId: question.question_id, userAnswer, isCorrect: result.isCorrect, timestamp: new Date().toISOString() }
      ]
    }
    persistSession(updated)
    setShowRemediation(Boolean(llmResult?.micro_remediation) || (!result.isCorrect && updated.wrongStreak >= 2))
    if (llmResult?.micro_remediation) {
      setFeedback((prev) => ({ ...prev, remediation: llmResult.micro_remediation }))
    }
    setIsEvaluating(false)
  }

  const advance = () => {
    let next = { ...session, currentQuestionIndex: session.currentQuestionIndex + 1 }
    const questionCount = section.interactive_questions.length

    if (next.currentQuestionIndex >= questionCount) {
      if (!next.completedSections.includes(section.section_id)) {
        next.completedSections = [...next.completedSections, section.section_id]
        trackEvent('section_completed', { courseId, sectionId: section.section_id })
      }
      next.currentQuestionIndex = 0
      next.currentSectionIndex += 1

      if (next.currentSectionIndex >= chapter.sections.length) {
        if (!next.completedChapters.includes(chapter.chapter)) {
          next.completedChapters = [...next.completedChapters, chapter.chapter]
          trackEvent('chapter_completed', { courseId, chapter: chapter.chapter })
        }
        next.currentSectionIndex = 0
        next.currentChapterIndex += 1
      }
    }

    setFeedback(null)
    setShowRemediation(false)

    if (next.currentChapterIndex >= selected.course_outline.length) {
      next.completedAt = new Date().toISOString()
      persistSession(next)
      navigate(`/learning/course/${courseId}/quiz`)
      return
    }

    persistSession(next)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Card className="border-slate-800 bg-slate-900/80 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Interactive session</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Chapter {chapter.chapter}: {section.title}</h1>
        <p className="text-sm text-slate-400">Section {sectionPosition} of {flatSections.length}</p>
        <div className="mt-3">
          <LearningProgressBar value={(sectionPosition / flatSections.length) * 100} label={`Question ${Math.min(section.interactive_questions.length, session.currentQuestionIndex + 1)} of ${section.interactive_questions.length}`} />
        </div>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60 p-5 space-y-4">
        {section.content_blocks.map((block, idx) => <ContentBlock key={`${section.section_id}-${idx}`} block={block} />)}
      </Card>

      <QuestionCard question={question} onSubmit={handleSubmitAnswer} disabled={!!feedback || isEvaluating} submitLabel={isEvaluating ? 'Evaluating...' : 'Submit Answer'} />
      <FeedbackCard result={feedback} />

      {showRemediation && (
        <Card className="border-amber-400/40 bg-amber-500/10 p-4">
          <p className="font-semibold text-amber-200">Micro-remediation</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-100">
            {(feedback?.remediation || [
              'Restate the concept in your own words before answering.',
              'Look for cue-action-reward sequence in examples.',
              'Prefer concrete behavior verbs over abstract goals.',
              'Think in daily systems, not one-time effort.'
            ]).map((line) => <li key={line}>{line}</li>)}
          </ul>
        </Card>
      )}

      <Button onClick={advance} disabled={!feedback} className="bg-sky-500 text-slate-950 hover:bg-sky-400">Next</Button>
    </div>
  )
}
