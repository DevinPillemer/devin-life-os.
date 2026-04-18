import { NextResponse } from "next/server";
import { purgeLegacyUndefinedCourses } from "@/lib/learning-cache";

export async function POST() {
  const result = await purgeLegacyUndefinedCourses();
  return NextResponse.json({ ok: true, ...result });
}
