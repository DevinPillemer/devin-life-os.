export interface CourseQuizQuestion {
  type: "multiple_choice" | "scenario" | "true_false";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface CourseChapter {
  title: string;
  learn: Array<{ concept: string; explanation: string; example: string }>;
  reflect: string[];
  optionalValueReflection?: string;
  quiz: CourseQuizQuestion[];
}

export interface GeneratedCourse {
  courseId: string;
  bookId: string;
  title: string;
  author?: string;
  category?: string;
  chapters: CourseChapter[];
}

const byKey = new Map<string, GeneratedCourse>();
const byId = new Map<string, GeneratedCourse>();

export function getCourseByKey(key: string) {
  return byKey.get(key);
}

export function getCourseById(courseId: string) {
  return byId.get(courseId);
}

export function saveCourse(key: string, course: GeneratedCourse) {
  byKey.set(key, course);
  byId.set(course.courseId, course);
}
