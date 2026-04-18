import { NextRequest, NextResponse } from "next/server";
import { getCourseById } from "@/lib/learning-cache";

export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get("courseId") || "";
  if (!courseId) return NextResponse.json({ ok: false, message: "courseId is required" }, { status: 400 });
  const course = getCourseById(courseId);
  if (!course) return NextResponse.json({ ok: false, message: "Course not found" }, { status: 404 });
  return NextResponse.json({ ok: true, course });
}
