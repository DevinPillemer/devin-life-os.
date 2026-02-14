import { CheckCircle2, XCircle } from 'lucide-react'

export default function FeedbackCard({ result }) {
  if (!result) return null
  return (
    <div className={`rounded-xl border p-4 ${result.isCorrect ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-amber-400/40 bg-amber-500/10'}`}>
      <div className="mb-2 flex items-center gap-2 font-semibold text-white">
        {result.isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <XCircle className="h-4 w-4 text-amber-300" />}
        {result.feedback}
      </div>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-200">
        {(result.bullets || []).map((bullet) => <li key={bullet}>{bullet}</li>)}
      </ul>
    </div>
  )
}
