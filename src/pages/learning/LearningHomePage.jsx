import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, CheckCircle2, Loader2, Medal, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { COURSES } from '@/data/seedData'
import { getProgressForCourse } from '@/data/learningModule'
import { generateCourse } from '@/services/llmService'

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

const mapStatusLabel = {
  completed: 'Completed',
  in_progress: 'In Progress',
  not_started: 'Not Started'
}

const progressSteps = ['Analyzing content...', 'Building chapters...', 'Creating quiz questions...', 'Generating exercises...']

export default function LearningHomePage() {
  const navigate = useNavigate()
  const [blinkText, setBlinkText] = useState('')
  const [notesText, setNotesText] = useState('')
  const [courses, setCourses] = useState(() => read(COURSES_KEY, []))
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('alphabetical')
  const [loadingId, setLoadingId] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)

  const sessions = read(SESSIONS_KEY, {})
  const certificates = read(CERT_KEY, [])

  useEffect(() => {
    if (!loadingId) return undefined
    const timer = setInterval(() => setLoadingStep((step) => (step + 1) % progressSteps.length), 1100)
    return () => clearInterval(timer)
  }, [loadingId])

  const generatedMap = useMemo(() => {
    const map = new Map()
    courses.forEach((entry) => {
      if (entry.seedBookId) map.set(entry.seedBookId, entry)
    })
    return map
  }, [courses])

  const library = useMemo(() => {
    return COURSES.map((book) => {
      const generated = generatedMap.get(book.id)
      const generatedCourse = generated?.course
      const progress = generatedCourse ? getProgressForCourse(generatedCourse, sessions[generatedCourse.id]) : { status: book.status || 'not_started', percent: 0 }
      return {
        ...book,
        generated,
        status: progress.status || book.status || 'not_started',
        percent: progress.percent || 0,
        moduleCount: book.modules?.length || 0
      }
    })
  }, [generatedMap, sessions])

  const stats = useMemo(() => {
    const completed = library.filter((item) => item.status === 'completed').length
    return {
      total: library.length,
      completed,
      certificates: certificates.length
    }
  }, [library, certificates.length])

  const filtered = useMemo(() => {
    let next = [...library]
    if (filter !== 'all') next = next.filter((book) => book.status === filter)
    if (search.trim()) {
      const query = search.toLowerCase()
      next = next.filter((book) => book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query))
    }

    if (sortBy === 'category') next.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title))
    else if (sortBy === 'status') next.sort((a, b) => a.status.localeCompare(b.status) || a.title.localeCompare(b.title))
    else next.sort((a, b) => a.title.localeCompare(b.title))
    return next
  }, [library, filter, search, sortBy])

  const generateFromBook = async (book, custom = {}) => {
    const cached = generatedMap.get(book.id)
    if (cached && !custom.forceRegenerate) {
      navigate(`/learning/course/${cached.course.id}`)
      return
    }

    setLoadingId(book.id)
    setLoadingStep(0)
    const payload = {
      title: book.title,
      author: book.author,
      modules: book.modules,
      key_insights: book.modules.flatMap((module) => module.key_insights || []),
      source_title: `${book.title} by ${book.author}`
    }
    const { courseJson, meta } = await generateCourse({ bookData: payload, ...custom }, 'book')

    const all = read(COURSES_KEY, []).filter((item) => item.seedBookId !== book.id)
    const next = [...all, { ...courseJson, seedBookId: book.id, llmSource: meta.source, generatedAt: new Date().toISOString() }]
    localStorage.setItem(COURSES_KEY, JSON.stringify(next))
    setCourses(next)
    setLoadingId('')
    navigate(`/learning/course/${courseJson.course.id}`)
  }

  const combinedText = (blinkText || notesText).trim()
  const preview = useMemo(() => {
    const text = combinedText
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0
    const title = text.split('\n').map((line) => line.trim()).find(Boolean)?.slice(0, 90) || 'Untitled source'
    return { title, words, estimatedMinutes: Math.max(12, Math.round(words / 95)) }
  }, [combinedText])

  const generateFromText = async () => {
    if (!combinedText) return
    setLoadingId('raw-text')
    setLoadingStep(0)
    const { courseJson, meta } = await generateCourse({ rawText: combinedText }, 'raw_text')
    const all = read(COURSES_KEY, []).filter((item) => item.course.id !== courseJson.course.id)
    const next = [...all, { ...courseJson, llmSource: meta.source, generatedAt: new Date().toISOString() }]
    localStorage.setItem(COURSES_KEY, JSON.stringify(next))
    setCourses(next)
    setLoadingId('')
    navigate(`/learning/course/${courseJson.course.id}`)
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <BookOpen className="h-3.5 w-3.5" />
          Floopify Learning Module
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-white">Dynamic Course Generation</h1>
        <p className="mt-2 text-slate-300">Generate interactive micro-courses from your tracked books or any pasted text.</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-emerald-300">Paste Blink Summary</p>
            <Textarea value={blinkText} onChange={(e) => setBlinkText(e.target.value)} placeholder="Paste Blink summary here..." className="min-h-36 border-slate-700 bg-slate-950" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-sky-300">Or paste any text/notes</p>
            <Textarea value={notesText} onChange={(e) => setNotesText(e.target.value)} placeholder="Paste notes, highlights, or freeform text..." className="min-h-36 border-slate-700 bg-slate-950" />
          </div>
        </div>

        {combinedText && (
          <Card className="mt-4 border-slate-700 bg-slate-950/80 p-4">
            <h3 className="text-sm font-semibold text-white">Input Preview</h3>
            <div className="mt-2 grid gap-2 text-sm text-slate-300 md:grid-cols-3">
              <p><span className="text-slate-400">Detected title:</span> {preview.title}</p>
              <p><span className="text-slate-400">Word count:</span> {preview.words}</p>
              <p><span className="text-slate-400">Estimated course length:</span> {preview.estimatedMinutes} min</p>
            </div>
            <Button onClick={generateFromText} disabled={loadingId === 'raw-text'} className="mt-3 bg-emerald-500 text-slate-950 hover:bg-emerald-400">
              {loadingId === 'raw-text' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Course from Text
            </Button>
            {loadingId === 'raw-text' && <p className="mt-2 text-xs text-slate-300">{progressSteps[loadingStep]}</p>}
          </Card>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Books" value={stats.total} icon={BookOpen} />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} />
        <StatCard label="Certificates" value={stats.certificates} icon={Medal} />
      </div>

      <Card className="border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-xl font-bold text-white">Course Library</h2>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {['all', 'completed', 'in_progress', 'not_started'].map((tab) => (
            <Button key={tab} variant={filter === tab ? 'default' : 'outline'} onClick={() => setFilter(tab)} className={filter === tab ? 'bg-sky-500 text-slate-950 hover:bg-sky-400' : ''}>
              {tab === 'all' ? 'All' : mapStatusLabel[tab]}
            </Button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or author" className="h-10 w-full bg-transparent text-sm text-slate-100 outline-none" />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200">
            <option value="alphabetical">Sort: Alphabetical</option>
            <option value="category">Sort: Category</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((book) => (
            <div key={book.id} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-white">{book.title}</p>
                  <p className="text-sm text-slate-400">{book.author}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${book.generated ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-200'}`}>
                  {book.generated ? 'Generated' : 'Seed only'}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">{book.category} • {book.moduleCount} modules</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200">{mapStatusLabel[book.status] || 'Not Started'}</span>
                <span className="text-sm text-slate-300">{book.percent}%</span>
              </div>
              <div className="mt-3 flex gap-2">
                {book.generated && (
                  <Button variant="outline" onClick={() => navigate(`/learning/course/${book.generated.course.id}`)}>
                    Open
                  </Button>
                )}
                <Button onClick={() => generateFromBook(book)} disabled={loadingId === book.id} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                  {loadingId === book.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Generate Course
                </Button>
              </div>
              {loadingId === book.id && (
                <div className="mt-3 space-y-1">
                  <div className="h-2 animate-pulse rounded bg-slate-700" />
                  <p className="text-xs text-slate-300">{progressSteps[loadingStep]}</p>
                </div>
              )}
            </div>
          ))}
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
