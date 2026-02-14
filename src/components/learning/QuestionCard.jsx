import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function QuestionCard({ question, onSubmit, disabled = false, submitLabel = 'Submit Answer', initialAnswer = '' }) {
  const [value, setValue] = useState(initialAnswer)

  useEffect(() => {
    setValue(initialAnswer || '')
  }, [initialAnswer, question?.question_id, question?.qid])

  if (!question) return null

  const isMcq = question.format === 'multiple_choice' || question.format === 'mcq'

  return (
    <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
      <p className="text-lg font-semibold text-white">{question.prompt}</p>
      {isMcq ? (
        <div className="space-y-2">
          {(question.choices || []).map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() => setValue(choice)}
              className={`w-full rounded-lg border px-3 py-2 text-left transition ${value === choice ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200' : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'}`}
            >
              {choice}
            </button>
          ))}
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your answer here..."
          className="min-h-28 border-slate-700 bg-slate-950 text-slate-100"
        />
      )}
      <Button disabled={disabled || !value.trim()} onClick={() => onSubmit(value)} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">{submitLabel}</Button>
    </div>
  )
}
