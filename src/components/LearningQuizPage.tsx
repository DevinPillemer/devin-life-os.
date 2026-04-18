"use client";

import { useMemo, useState } from "react";

export default function LearningQuizPage({ quiz, onScore }: { quiz: any[]; onScore: (score: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    const total = quiz.length || 1;
    const correct = quiz.reduce((sum, q, i) => sum + (answers[i] === q.correctAnswer ? 1 : 0), 0);
    return Math.round((correct / total) * 100);
  }, [answers, quiz]);

  return (
    <div className="space-y-4">
      {quiz.map((q, i) => (
        <div key={i} className="rounded-lg border border-slate-700 p-4 bg-slate-900/50">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">{q.type.replace("_", " ")}</div>
          <p className="text-white font-medium">{i + 1}. {q.question}</p>
          <div className="mt-3 space-y-2">
            {(q.options || []).map((opt: string) => (
              <button key={opt} onClick={() => setAnswers((s) => ({ ...s, [i]: opt }))} className={`w-full text-left rounded px-3 py-2 border ${answers[i] === opt ? "border-cyan-400 bg-cyan-500/10" : "border-slate-700 hover:border-slate-600"}`}>
                {opt}
              </button>
            ))}
          </div>
          {submitted && (
            <p className="text-sm mt-3 text-slate-300">Answer: <b>{q.correctAnswer}</b> · {q.explanation}</p>
          )}
        </div>
      ))}
      <div className="flex items-center gap-3">
        <button onClick={() => { setSubmitted(true); onScore(score); }} className="px-4 py-2 rounded bg-cyan-500 text-slate-950 font-semibold">Submit Quiz</button>
        {submitted && <span className="text-slate-200">Score: <b>{score}%</b></span>}
      </div>
    </div>
  );
}
