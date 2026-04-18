"use client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function LegacyCourseIdRedirectPage() {
  const params = useParams<{ courseId: string }>();

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/learning/course?courseId=${encodeURIComponent(params.courseId)}`, { cache: "no-store" });
      const data = await res.json();
      if (data?.ok && data.course?.slug) {
        window.location.href = `/learning/course/${data.course.slug}`;
      }
    })();
  }, [params.courseId]);

  return <main className="min-h-screen bg-surface-dark p-6 text-slate-100">Redirecting to course slug…</main>;
}
