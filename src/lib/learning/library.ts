import { listCourses, slugifyTitle, upsertCourse } from "@/lib/learning-cache";

export async function listGeneratedCourses() {
  return listCourses();
}

export function buildCourseSlug(title: string, fallbackLine: string) {
  return slugifyTitle((title || fallbackLine || "Untitled Course").trim());
}

export async function saveGeneratedCourseUpsert(course: any) {
  return upsertCourse(course);
}
