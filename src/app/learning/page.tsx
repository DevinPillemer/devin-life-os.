"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { seedBooks } from "@/lib/learning-seed-books";

export default function LearningHomePage() {
  const [summaryText, setSummaryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [showSeedOnly, setShowSeedOnly] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadCourses = async () => {
    const res = await fetch(`/api/learning/course?includeSeed=${showSeedOnly ? "1" : "0"}`, { cache: "no-store" });
    const data = await res.json();
    if (data?.ok) setCourses(data.courses || []);
  };

  useEffect(() => {
    loadCourses();
  }, [showSeedOnly]);

  const generate = async (
    book?: { id: string; title: string; author: string; category: string },
    existing?: { title?: string; author?: string; category?: string; sourceText?: string },
  ) => {
    setLoading(true);
    setErrorMsg("");
    const res = await fetch("/api/learning/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: book?.title ?? existing?.title,
        author: book?.author ?? existing?.author,
        category: book?.category ?? existing?.category,
        summaryText: summaryText.trim() || existing?.sourceText || "",
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!data?.ok) {
      setErrorMsg(data?.message || "Failed to generate");
      return;
    }
    await loadCourses();
    const slug = data?.course?.slug;
    if (!slug || String(slug).includes("undefined")) {
      setErrorMsg("Invalid course slug returned by API.");
      return;
    }
    window.location.href = `/learning/course/${slug}`;
  };

  const generatedCourses = useMemo(() => courses.filter((c) => c.sourceText), [courses]);
  const learningValues = useMemo(() => Array.from(new Set(seedBooks.map((b) => b.category))), []);

  return (
    <main className="min-h-screen bg-surface-dark p-6 space-y-4">
      <h1 className="text-3xl font-bold text-white">Learning Courses</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <textarea value={summaryText} onChange={(e) => setSummaryText(e.target.value)} rows={10} className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-slate-100" placeholder="Paste Blinkist summary text here..." />

          <div className="flex items-center gap-3">
            <button disabled={loading || !summaryText.trim()} onClick={() => generate()} className="px-4 py-2 rounded bg-cyan-500 text-slate-950 font-semibold disabled:opacity-50">Generate Course from Text</button>
            <label className="text-sm text-slate-300 flex items-center gap-2"><input type="checkbox" checked={showSeedOnly} onChange={(e) => setShowSeedOnly(e.target.checked)} /> Show seed-only templates</label>
          </div>
          {!!errorMsg && <p className="text-sm text-rose-300 border border-rose-500/40 bg-rose-500/10 rounded p-3">{errorMsg}</p>}
        </div>

        <aside className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 space-y-4 h-fit">
          <div>
            <h2 className="text-sm uppercase tracking-wider text-slate-400">Previous books</h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-200">
              {seedBooks.slice(0, 8).map((book) => (
                <li key={book.id}>• {book.title} <span className="text-slate-400">({book.author})</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm uppercase tracking-wider text-slate-400">Learning values</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {learningValues.map((value) => (
                <span key={value} className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700">{value}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl text-white font-semibold">Course Library</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {generatedCourses.map((course) => (
            <div key={course.courseId} className="rounded-lg border border-slate-700 p-4 bg-slate-900/50">
              <div className="text-white font-semibold">{course.title}</div>
              <div className="text-slate-400 text-sm">{course.chapters?.length || 0} chapters · Updated {new Date(course.updatedAt).toLocaleString()}</div>
              <div className="mt-3 flex gap-2">
                <Link href={`/learning/course/${course.slug}`} className="px-3 py-2 rounded bg-cyan-500 text-slate-950 font-semibold">Open</Link>
                <button
                  disabled={loading}
                  onClick={() => generate(undefined, { title: course.title, author: course.author, category: course.category, sourceText: course.sourceText })}
                  className="px-3 py-2 rounded bg-amber-400 text-slate-900 font-semibold disabled:opacity-50"
                >
                  Regenerate
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showSeedOnly && (
        <section className="space-y-3">
          <h2 className="text-xl text-white font-semibold">Seed Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {seedBooks.map((book) => (
              <div key={book.id} className="rounded-lg border border-slate-700 p-4 bg-slate-900/50">
                <div className="text-white font-semibold">{book.title}</div>
                <div className="text-slate-400 text-sm">{book.author} · {book.category}</div>
                <button disabled={loading || !summaryText.trim()} onClick={() => generate(book)} className="mt-3 px-3 py-2 rounded bg-cyan-500 text-slate-950 font-semibold disabled:opacity-50">Generate</button>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
