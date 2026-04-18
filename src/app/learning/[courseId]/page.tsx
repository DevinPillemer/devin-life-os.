"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LearningQuizPage from "@/components/LearningQuizPage";

const tabs = ["learn", "reflect", "quiz"] as const;

type Tab = (typeof tabs)[number];

export default function CoursePage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params.courseId;

  const [course, setCourse] = useState<any>(null);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [tab, setTab] = useState<Tab>("learn");
  const [scores, setScores] = useState<Record<number, number>>({});

  useEffect(() => {
    const local = localStorage.getItem(`learningCourse:${courseId}`);
    if (local) setCourse(JSON.parse(local));
    const progress = localStorage.getItem(`learningProgress:${courseId}`);
    if (progress) {
      const parsed = JSON.parse(progress);
      setScores(parsed.scores || {});
      setChapterIdx(parsed.chapterIdx || 0);
    }
  }, [courseId]);

  useEffect(() => {
    localStorage.setItem(`learningProgress:${courseId}`, JSON.stringify({ scores, chapterIdx }));
  }, [scores, chapterIdx, courseId]);

  const done = useMemo(() => course?.chapters?.length > 0 && course.chapters.every((_: any, i: number) => (scores[i] || 0) >= 80), [course, scores]);

  const regenerate = async () => {
    const res = await fetch("/api/learning/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: course.bookId, title: course.title, author: course.author, category: course.category, seed: `${course.title} ${course.author || ""}`, regenerate: true }),
    });
    const data = await res.json();
    if (!data?.ok) return alert(data?.message || "Failed to regenerate");
    localStorage.setItem(`learningCourse:${data.course.courseId}`, JSON.stringify(data.course));
    router.push(`/learning/${data.course.courseId}`);
  };

  if (!course) return <main className="min-h-screen bg-surface-dark p-6 text-slate-200">Loading course…</main>;
  const chapter = course.chapters?.[chapterIdx];
  if (!chapter) return <main className="min-h-screen bg-surface-dark p-6 text-slate-200">Course has no chapters.</main>;

  if (done) {
    return <main className="min-h-screen bg-surface-dark p-6 text-center text-slate-100"><h1 className="text-4xl font-bold">Certificate Unlocked</h1><p className="mt-2">You scored 80%+ on all chapters in {course.title}.</p></main>;
  }

  return (
    <main className="min-h-screen bg-surface-dark p-6 flex gap-6">
      <aside className="w-72 sticky top-4 self-start rounded-lg border border-slate-700 bg-slate-900/70 p-4 h-[calc(100vh-2rem)] overflow-auto">
        <h2 className="text-white font-semibold mb-2">{course.title}</h2>
        <button onClick={regenerate} className="mb-3 text-xs px-2 py-1 rounded bg-amber-400 text-slate-900 font-semibold">Regenerate</button>
        <div className="space-y-2">
          {course.chapters.map((ch: any, i: number) => (
            <button key={i} onClick={() => setChapterIdx(i)} className={`w-full text-left px-3 py-2 rounded border ${chapterIdx === i ? "border-cyan-400 text-cyan-200" : "border-slate-700 text-slate-300"}`}>
              {i + 1}. {ch.title}
              {!!scores[i] && <span className="block text-xs text-slate-400">Quiz: {scores[i]}%</span>}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex-1 space-y-4">
        <div className="flex gap-2">{tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded ${tab === t ? "bg-cyan-500 text-slate-950" : "bg-slate-900 text-slate-300 border border-slate-700"}`}>{t.toUpperCase()}</button>)}</div>
        <h1 className="text-2xl text-white font-bold">{chapter.title}</h1>

        {tab === "learn" && <div className="space-y-3">{chapter.learn?.map((item: any, i: number) => <div key={i} className="rounded-lg border border-slate-700 p-4 bg-slate-900/60"><p className="text-white"><b>{item.concept}</b></p><p className="text-slate-200 mt-1">{item.explanation}</p><p className="text-cyan-200 text-sm mt-2">Example: {item.example}</p></div>)}</div>}
        {tab === "reflect" && <div className="space-y-3">{chapter.reflect?.map((q: string, i: number) => <div key={i} className="rounded-lg border border-slate-700 p-4 text-slate-100 bg-slate-900/60">{q}</div>)}{chapter.optionalValueReflection && <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-4 text-violet-100">Optional values reflection: {chapter.optionalValueReflection}</div>}</div>}
        {tab === "quiz" && <LearningQuizPage quiz={chapter.quiz || []} onScore={(score) => setScores((s) => ({ ...s, [chapterIdx]: score }))} />}
      </section>
    </main>
  );
}
