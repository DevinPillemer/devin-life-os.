import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, Loader2, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import LearningProgressBar from '@/components/learning/ProgressBar'
import { getProgressForCourse } from '@/data/learningModule'
import { COURSES } from '@/data/seedData'
import { generateCourse } from '@/services/llmService'

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

export default function LearningCourseOverviewPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [showGlossary, setShowGlossary] = useState(false)
  const [difficulty, setDifficulty] = useState('beginner')
  const [focusAreas, setFocusAreas] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const courses = read('floopify_courses', [])
  const sessions = read('floopify_sessions', {})
  const selectedEntry = courses.find((item) => item.course.id === courseId)
  const selected = selectedEntry?.course

  const progress = useMemo(() => selected ? getProgressForCourse(selected, sessions[courseId]) : { percent: 0, completedSections: 0, totalSections: 0 }, [selected, sessions, courseId])

  if (!selected) return <Card className="border-slate-800 bg-slate-900 p-6 text-slate-200">Course not found. Go to /learning and generate one.</Card>

  const regenerate = async () => {
    const seedBookId = selectedEntry?.seedBookId
    if (!seedBookId) return
    const sourceBook = COURSES.find((book) => book.id === seedBookId)
    if (!sourceBook) return

    setIsRegenerating(true)
    const { courseJson, meta } = await generateCourse({
      bookData: {
        title: sourceBook.title,
        author: sourceBook.author,
        modules: sourceBook.modules,
        key_insights: sourceBook.modules.flatMap((module) => module.key_insights || []),
        source_title: `${sourceBook.title} by ${sourceBook.author}`
      },
      difficulty,
      focusAreas,
      forceRegenerate: true
    }, 'book')

    const nextCourses = courses.filter((item) => item.seedBookId !== seedBookId)
    nextCourses.push({ ...courseJson, seedBookId, llmSource: meta.source, generatedAt: new Date().toISOString() })
    localStorage.setItem('floopify_courses', JSON.stringify(nextCourses))
    setIsRegenerating(false)
    navigate(`/learning/course/${courseJson.course.id}`)
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold text-white">{selected.title}</h1>
          <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold uppercase text-sky-300">{selected.difficulty}</span>
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">{selected.estimated_total_minutes} min</span>
        </div>
        <p className="mt-2 text-slate-300">{selected.tagline}</p>
        <div className="mt-4">
          <LearningProgressBar value={progress.percent} label={`${progress.completedSections}/${progress.totalSections} sections complete`} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={() => navigate(`/learning/course/${courseId}/session`)} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">Start Learning</Button>
          {selectedEntry?.seedBookId && (
            <Button variant="outline" onClick={regenerate} disabled={isRegenerating}>
              {isRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}Regenerate Course
            </Button>
          )}
        </div>
      </Card>

      {selectedEntry?.seedBookId && (
        <Card className="border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-bold text-white">Customization</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <input value={focusAreas} onChange={(e) => setFocusAreas(e.target.value)} placeholder="Focus areas (e.g. leadership, execution, habits)" className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
          </div>
          <p className="mt-2 text-xs text-slate-400">Regeneration keeps your library cache updated and replaces the prior generated version for this book.</p>
        </Card>
      )}

      <Card className="border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-bold text-white">Learning Objectives</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-200">
          {selected.learning_objectives.map((objective) => <li key={objective}>{objective}</li>)}
        </ul>
      </Card>

      <Card className="border-slate-800 bg-slate-900/70 p-5">
        <button className="flex w-full items-center justify-between text-left" onClick={() => setShowGlossary((v) => !v)}>
          <h2 className="text-lg font-bold text-white">Key Terms Glossary</h2>
          {showGlossary ? <ChevronUp className="h-4 w-4 text-slate-300" /> : <ChevronDown className="h-4 w-4 text-slate-300" />}
        </button>
        {showGlossary && (
          <div className="mt-3 space-y-3">
            {selected.key_terms.map((item) => (
              <div key={item.term} className="rounded-lg border border-slate-700 bg-slate-900 p-3">
                <p className="font-semibold text-emerald-300">{item.term}</p>
                <p className="text-sm text-slate-300">{item.definition}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-bold text-white">Chapters</h2>
        <div className="mt-4 space-y-4">
          {selected.course_outline.map((chapter) => (
            <div key={chapter.chapter} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
              <p className="font-semibold text-white">Chapter {chapter.chapter}: {chapter.title}</p>
              <p className="text-sm text-slate-400">{chapter.minutes} minutes</p>
              <div className="mt-3 space-y-2">
                {chapter.sections.map((section) => {
                  const done = sessions[courseId]?.completedSections?.includes(section.section_id)
                  return (
                    <div key={section.section_id} className="flex items-center justify-between rounded border border-slate-800 px-3 py-2 text-sm">
                      <span className="text-slate-200">{section.section_id} • {section.title}</span>
                      <span className={`rounded-full px-2 py-1 text-xs ${done ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'}`}>{done ? 'Completed' : 'Pending'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
