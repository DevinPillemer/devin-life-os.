"use client";

import { useMemo, useState } from "react";

export default function LearningQuizPage({ quiz, onScore }: { quiz: any[]; onScore: (score: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    const autoGraded = quiz.filter((q) => q.type !== "short_answer");
    const total = autoGraded.length || 1;
    const correct = autoGraded.reduce((sum, q) => {
      const idx = quiz.indexOf(q);
      return sum + (answers[idx] === q.answer ? 1 : 0);
    }, 0);
    return Math.round((correct / total) * 100);
  }, [answers, quiz]);

  return (
    <div className="space-y-4">
      {quiz.map((q, i) => (
        <div key={i} className="rounded-lg border border-slate-700 p-4 bg-slate-900/50">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">{String(q.type || "question").replace("_", " ")}</div>
          <p className="text-white font-medium">{i + 1}. {q.prompt || q.question}</p>
          {q.type === "short_answer" ? (
            <textarea onChange={(e) => setAnswers((s) => ({ ...s, [i]: e.target.value }))} className="w-full mt-3 rounded bg-slate-800 border border-slate-700 p-2 text-slate-100" rows={3} placeholder="Write your answer..." />
          ) : (
            <div className="mt-3 space-y-2">
              {(q.options || []).map((opt: string) => (
                <button key={opt} onClick={() => setAnswers((s) => ({ ...s, [i]: opt }))} className={`w-full text-left rounded px-3 py-2 border ${answers[i] === opt ? "border-cyan-400 bg-cyan-500/10" : "border-slate-700 hover:border-slate-600"}`}>
                  {opt}
                </button>
              ))}
            </div>
          )}
          {submitted && (
            <p className="text-sm mt-3 text-slate-300">Answer: <b>{q.answer || "Open response"}</b> · {q.explanation}</p>
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
