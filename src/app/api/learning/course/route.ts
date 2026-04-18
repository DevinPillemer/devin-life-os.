import { NextRequest, NextResponse } from "next/server";
import { awardCourseCompletion, listCourses, markSectionComplete } from "@/lib/learning-cache";
import { seedBooks } from "@/lib/learning-seed-books";

export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get("courseId") || "";
  const slug = req.nextUrl.searchParams.get("slug") || "";
  const includeSeed = req.nextUrl.searchParams.get("includeSeed") === "1";

  if (courseId || slug) {
    const all = await listCourses();
    const course = courseId ? all.find((c) => c.courseId === courseId) : all.find((c) => c.slug === slug);
    if (!course) return NextResponse.json({ ok: false, message: "Course not found" }, { status: 404 });
    return NextResponse.json({ ok: true, course });
  }

  const courses = await listCourses();
  return NextResponse.json({
    ok: true,
    courses,
    seedBooks: includeSeed ? seedBooks : [],
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  if (body.action === "complete-section") {
    const course = await markSectionComplete(body.courseId, body.sectionId);
    if (!course) return NextResponse.json({ ok: false, message: "Course not found" }, { status: 404 });
    return NextResponse.json({ ok: true, course });
  }

  if (body.action === "complete-course") {
    const result = await awardCourseCompletion(body.courseId);
    if (!result) return NextResponse.json({ ok: false, message: "Course not found" }, { status: 404 });
    return NextResponse.json({ ok: true, ...result, learningReward: result.rewardGranted ? 160 : 0 });
  }

  return NextResponse.json({ ok: false, message: "Unknown action" }, { status: 400 });
}
