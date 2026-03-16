import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { List, Pause, Play, TextCursorInput } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

const FALLBACK_READER = {
  title: 'The AI-fication of Jobs',
  author: 'Huy Nguyen Trieu',
  chapters: [
    {
      id: 'intro',
      label: "What's in it for me? Get a better idea of how AI will shape the future.",
      content: [
        'Artificial intelligence is no longer a distant trend; it is quickly becoming the substrate of modern work. From decision support systems to generative copilots, AI is changing how teams create value, make decisions, and distribute expertise.',
        'This reader gives you a practical map of what is happening now, what is likely to happen next, and how to prepare so you are amplified rather than displaced. The key is to focus on augmenting human judgment, creativity, and coordination with machine capabilities.',
        'As you read, pay attention to repeatable mental models you can apply to your own role: where to automate, where to supervise, and where to lead.'
      ]
    },
    {
      id: 'chapter-1',
      label: 'Chapter 1: Three revolutions',
      content: [
        'Today\'s AI wave combines three overlapping revolutions: data at scale, cheap cloud compute, and model breakthroughs. Together they unlock capabilities that were infeasible a decade ago.',
        'The first revolution is the data revolution. Every business process now emits signals that can be turned into predictions and recommendations.',
        'The second is compute. Massive infrastructure and specialized chips make experimentation fast enough for continuous product iteration.',
        'The third is algorithmic. New architectures generalize across tasks, which means one foundation can power many workflows.'
      ]
    },
    {
      id: 'chapter-2',
      label: 'Chapter 2: Why AI is different',
      content: [
        'Previous automation replaced repetitive tasks. AI increasingly touches cognitive tasks, including drafting, classification, synthesis, and even strategic exploration.',
        'That difference matters because knowledge work is not a small niche. Nearly every role includes cognitive loops that can now be accelerated.',
        'The organizations that win will redesign work around human-AI collaboration instead of layering AI onto legacy processes.'
      ]
    },
    {
      id: 'chapter-3',
      label: 'Chapter 3: Modeling for the future',
      content: [
        'Leaders need scenario thinking. Rather than predicting one fixed outcome, build multiple credible futures and test how resilient your skills and systems are under each.',
        'A useful framing: classify tasks into automate, augment, and anchor. Automate routine outputs, augment expert workflows, and anchor high-stakes judgment with human accountability.',
        'This model helps teams invest in the right tools while preserving trust and quality.'
      ]
    },
    {
      id: 'chapter-4',
      label: 'Chapter 4: Looking through the prism',
      content: [
        'AI impact is not uniform. View it through a prism: industry structure, regulatory context, data availability, and customer tolerance for risk.',
        'In highly regulated sectors, explainability and auditability become strategic advantages. In fast-moving creative sectors, speed and experimentation dominate.',
        'Understanding your prism helps you prioritize where to pilot first and where guardrails must come first.'
      ]
    },
    {
      id: 'chapter-5',
      label: 'Chapter 5: Preparing to be supercharged',
      content: [
        'Preparation starts with literacy: understand how models behave, where they fail, and how to prompt and verify outputs.',
        'Next, redesign routines. Build lightweight AI habits into planning, writing, research, and review loops. Small daily integrations compound quickly.',
        'Finally, cultivate distinctly human strengths: sensemaking, ethics, communication, and leadership. These become more valuable as baseline execution gets automated.'
      ]
    },
    {
      id: 'final-summary',
      label: 'Final summary',
      content: [
        'AI will reshape jobs, but the deeper story is how it reshapes work design. The most resilient professionals will pair technical fluency with domain judgment.',
        'Think in systems. Decide where machines should generate, where humans should decide, and where both should collaborate. That architecture is your long-term edge.',
        'The future belongs to people and organizations that learn continuously and turn AI into a force multiplier for meaningful work.'
      ]
    }
  ]
}

export default function LearningCourseOverviewPage() {
  const { courseId } = useParams()
  const courses = read('floopify_courses', [])
  const selected = courses.find((item) => item.course.id === courseId)?.course

  const readerData = useMemo(() => {
    const title = selected?.title || FALLBACK_READER.title
    const author = selected?.metadata?.source_author || FALLBACK_READER.author

    return {
      title,
      author,
      chapters: FALLBACK_READER.chapters
    }
  }, [selected])

  const [activeTab, setActiveTab] = useState('for-you')
  const [activeChapter, setActiveChapter] = useState(0)
  const [fontSize, setFontSize] = useState(18)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(68)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const chapter = readerData.chapters[activeChapter]
  const chapterCount = readerData.chapters.length

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 pb-24">
      <Card className="border-slate-800 bg-slate-950/95 p-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-full border border-slate-700 bg-slate-900 p-1">
            <button
              onClick={() => setActiveTab('for-you')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${activeTab === 'for-you' ? 'bg-emerald-400 text-slate-950' : 'text-slate-300'}`}
            >
              For You
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${activeTab === 'explore' ? 'bg-emerald-400 text-slate-950' : 'text-slate-300'}`}
            >
              Explore
            </button>
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Learning reader</div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-3 flex items-center gap-2 text-slate-200">
            <List className="h-4 w-4" />
            <p className="text-sm font-semibold uppercase tracking-[0.12em]">Table of contents</p>
          </div>
          <div className="space-y-2">
            {readerData.chapters.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActiveChapter(index)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  index === activeChapter
                    ? 'border-emerald-300/60 bg-emerald-500/10 text-emerald-200'
                    : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-slate-500'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="border-slate-800 bg-[#f8f1e5] p-6 text-slate-900 lg:p-10">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-300/80 pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-600">Blink-style course</p>
              <h1 className="mt-2 text-3xl font-bold leading-tight">{readerData.title}</h1>
              <p className="mt-1 text-sm text-slate-600">by {readerData.author}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-1.5 text-sm text-slate-700">
              <TextCursorInput className="h-4 w-4" />
              <span>Aa</span>
              <button onClick={() => setFontSize((size) => Math.max(14, size - 1))} className="rounded px-2 py-0.5 hover:bg-slate-100">-</button>
              <span className="w-8 text-center">{fontSize}</span>
              <button onClick={() => setFontSize((size) => Math.min(26, size + 1))} className="rounded px-2 py-0.5 hover:bg-slate-100">+</button>
            </div>
          </div>

          <article className="mt-6">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{activeChapter + 1} / {chapterCount}</p>
            <h2 className="mt-2 text-2xl font-semibold leading-snug">{chapter.label}</h2>
            <div className="mt-5 space-y-5 leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
              {chapter.content.map((paragraph) => (
                <p key={paragraph} className="text-slate-800">{paragraph}</p>
              ))}
            </div>
          </article>
        </Card>
      </div>

      <Card className="fixed bottom-5 left-1/2 z-20 w-[min(980px,calc(100vw-2.5rem))] -translate-x-1/2 border-slate-700 bg-slate-950/95 p-4 shadow-2xl shadow-black/60">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setIsPlaying((v) => !v)} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
            {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>

          <div className="min-w-[230px] flex-1">
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-emerald-400"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>12:42</span>
              <span>18:30</span>
            </div>
          </div>

          <button
            onClick={() => setPlaybackSpeed((speed) => (speed === 1 ? 1.25 : speed === 1.25 ? 1.5 : 1))}
            className="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:border-slate-400"
          >
            {playbackSpeed}x
          </button>
        </div>
      </Card>
    </div>
  )
}
