"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { seedBooks } from "@/lib/learning-seed-books";

export default function LearningHomePage() {
  const [summaryText, setSummaryText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const generate = async (book: { id: string; title: string; author: string; category: string }) => {
    setLoading(true);
    const res = await fetch("/api/learning/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: book.id, title: book.title, author: book.author, category: book.category, summaryText }),
    });
    const data = await res.json();
    setLoading(false);
    if (!data?.ok) return alert(data?.message || "Failed to generate");
    localStorage.setItem(`learningCourse:${data.course.courseId}`, JSON.stringify(data.course));
    router.push(`/learning/${data.course.courseId}`);
  };

  return (
    <main className="min-h-screen bg-surface-dark p-6 space-y-4">
      <h1 className="text-3xl font-bold text-white">Learning Courses</h1>
      <textarea value={summaryText} onChange={(e) => setSummaryText(e.target.value)} rows={10} className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-slate-100" placeholder="Paste Blinkist summary text here..." />
      <p className="text-slate-400 text-sm">You can paste full chapter text, or generate from seed book metadata only.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {seedBooks.map((book) => (
          <div key={book.id} className="rounded-lg border border-slate-700 p-4 bg-slate-900/50">
            <div className="text-white font-semibold">{book.title}</div>
            <div className="text-slate-400 text-sm">{book.author} · {book.category}</div>
            <button disabled={loading} onClick={() => generate(book)} className="mt-3 px-3 py-2 rounded bg-cyan-500 text-slate-950 font-semibold disabled:opacity-50">Generate Course</button>
          </div>
        ))}
      </div>
    </main>
  );
}
