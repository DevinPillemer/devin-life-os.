import { promises as fs } from "node:fs";
import path from "node:path";

export type QuestionType = "multiple_choice" | "true_false" | "short_answer";

export interface CourseQuestion {
  type: QuestionType;
  prompt: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface CourseChapter {
  title: string;
  summary: string;
  teaching: string;
  tryThis: string;
  questions: CourseQuestion[];
}

export interface CourseGlossaryTerm {
  term: string;
  definition: string;
}

export interface GeneratedCourse {
  courseId: string;
  slug: string;
  title: string;
  author?: string;
  category?: string;
  sourceText: string;
  objectives: string[];
  glossary: CourseGlossaryTerm[];
  chapters: CourseChapter[];
  finalQuiz: CourseQuestion[];
  certificatesAwarded?: number;
  completionRewarded?: boolean;
  completedSections?: string[];
  createdAt: string;
  updatedAt: string;
}

interface LearningStore {
  courses: GeneratedCourse[];
}

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(STORE_DIR, "learning-store.json");

async function ensureStore() {
  await fs.mkdir(STORE_DIR, { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify({ courses: [] } as LearningStore, null, 2), "utf8");
  }
}

async function readStore(): Promise<LearningStore> {
  await ensureStore();
  const raw = await fs.readFile(STORE_PATH, "utf8");
  const parsed = JSON.parse(raw || "{}");
  return {
    courses: Array.isArray(parsed.courses) ? parsed.courses : [],
  };
}

async function writeStore(store: LearningStore) {
  await ensureStore();
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function slugifyTitle(input: string) {
  const cleaned = input
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "untitled-course";
}

export async function upsertCourse(course: Omit<GeneratedCourse, "createdAt" | "updatedAt" | "courseId"> & { courseId?: string }) {
  const store = await readStore();
  const now = new Date().toISOString();
  const index = store.courses.findIndex((c) => c.slug === course.slug);

  if (index >= 0) {
    const existing = store.courses[index];
    const merged: GeneratedCourse = {
      ...existing,
      ...course,
      courseId: existing.courseId,
      createdAt: existing.createdAt,
      updatedAt: now,
    };
    store.courses[index] = merged;
    await writeStore(store);
    return merged;
  }

  const created: GeneratedCourse = {
    ...course,
    courseId: course.courseId || `${course.slug}-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  store.courses.unshift(created);
  await writeStore(store);
  return created;
}

export async function listCourses() {
  const store = await readStore();
  return store.courses.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getCourseById(courseId: string) {
  const store = await readStore();
  return store.courses.find((c) => c.courseId === courseId) || null;
}

export async function getCourseBySlug(slug: string) {
  const store = await readStore();
  return store.courses.find((c) => c.slug === slug) || null;
}

export async function markSectionComplete(courseId: string, sectionId: string) {
  const store = await readStore();
  const idx = store.courses.findIndex((c) => c.courseId === courseId);
  if (idx < 0) return null;
  const set = new Set(store.courses[idx].completedSections || []);
  set.add(sectionId);
  store.courses[idx].completedSections = Array.from(set);
  store.courses[idx].updatedAt = new Date().toISOString();
  await writeStore(store);
  return store.courses[idx];
}

export async function awardCourseCompletion(courseId: string) {
  const store = await readStore();
  const idx = store.courses.findIndex((c) => c.courseId === courseId);
  if (idx < 0) return null;

  const course = store.courses[idx];
  const alreadyRewarded = !!course.completionRewarded;
  course.completionRewarded = true;
  course.certificatesAwarded = (course.certificatesAwarded || 0) + 1;
  course.updatedAt = new Date().toISOString();
  store.courses[idx] = course;
  await writeStore(store);

  return { course, rewardGranted: !alreadyRewarded };
}
