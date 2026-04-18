"use client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import LearningQuizPage from "@/components/LearningQuizPage";

export default function CourseBySlugPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [course, setCourse] = useState<any>(null);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});
  const [finalDone, setFinalDone] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/learning/course?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
      const data = await res.json();
      if (data?.ok) setCourse(data.course);
    })();
  }, [slug]);

  const completedCount = useMemo(() => Object.keys(scores).filter((k) => (scores[Number(k)] || 0) >= 70).length, [scores]);
  const progressPct = course?.chapters?.length ? Math.round((completedCount / course.chapters.length) * 100) : 0;
  const allSectionsDone = course?.chapters?.length > 0 && completedCount >= course.chapters.length;

  const markSection = async (idx: number, score: number) => {
    setScores((s) => ({ ...s, [idx]: score }));
    if (score >= 70) {
      await fetch("/api/learning/course", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete-section", courseId: course.courseId, sectionId: `${idx}` }),
      });
    }
  };

  const completeCourse = async () => {
    const res = await fetch("/api/learning/course", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete-course", courseId: course.courseId }),
    });
    const data = await res.json();
    if (data?.ok) {
      setCourse(data.course);
      setFinalDone(true);
      alert(data.rewardGranted ? "Course complete! Learning reward added." : "Course already rewarded previously.");
    }
  };

  if (!course) return <main className="min-h-screen bg-surface-dark p-6 text-slate-100">Loading…</main>;

  return (
    <main className="min-h-screen bg-surface-dark p-6 space-y-4">
      <h1 className="text-3xl text-white font-bold">{course.title}</h1>
      <p className="text-slate-300">Slug: <code>{course.slug}</code></p>
      <div className="h-2 rounded bg-slate-800 overflow-hidden"><div className="h-full bg-cyan-500" style={{ width: `${progressPct}%` }} /></div>
      <p className="text-sm text-slate-300">Progress: {completedCount}/{course.chapters.length} sections complete</p>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-1 space-y-2">
          {course.chapters.map((ch: any, i: number) => (
            <div key={i} className="rounded border border-slate-700 bg-slate-900/60">
              <button className="w-full text-left px-3 py-2" onClick={() => setOpenMap((m) => ({ ...m, [i]: !m[i] }))}>
                <div className="text-white font-medium">{ch.title}</div>
                <div className="text-xs text-slate-400">{ch.summary}</div>
              </button>
              {openMap[i] && <button onClick={() => setChapterIdx(i)} className="mx-3 mb-3 px-3 py-1 rounded bg-cyan-500 text-slate-900 text-sm">Open chapter</button>}
            </div>
          ))}
        </div>

        <div className="md:col-span-2 rounded-lg border border-slate-700 bg-slate-900/60 p-4 space-y-4">
          <h2 className="text-xl text-white font-semibold">{course.chapters[chapterIdx].title}</h2>
          <div className="rounded border border-slate-700 bg-slate-950/40 p-3">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Summary</h3>
            <p className="text-slate-100 whitespace-pre-line">{course.chapters[chapterIdx].summary}</p>
          </div>
          <div className="rounded border border-slate-700 bg-slate-950/40 p-3">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Key Takeaways</h3>
            <p className="text-slate-100 whitespace-pre-line">{course.chapters[chapterIdx].teaching}</p>
          </div>
          <div className="rounded border border-cyan-600/40 bg-cyan-500/10 p-3 text-cyan-100">{course.chapters[chapterIdx].tryThis}</div>
          <LearningQuizPage quiz={course.chapters[chapterIdx].questions || []} onScore={(score) => markSection(chapterIdx, score)} />
        </div>
      </section>

      {allSectionsDone && !finalDone && (
        <section className="space-y-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4">
          <h3 className="text-xl text-emerald-100 font-semibold">Final Quiz</h3>
          <LearningQuizPage quiz={course.finalQuiz || []} onScore={() => completeCourse()} />
        </section>
      )}

      {finalDone && <p className="text-emerald-200 font-semibold">Certificate count: {course.certificatesAwarded || 0}</p>}
    </main>
  );
}
