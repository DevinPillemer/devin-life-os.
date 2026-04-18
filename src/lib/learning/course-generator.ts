import { CourseChapter, CourseGlossaryTerm, CourseQuestion, GeneratedCourse, slugifyTitle } from "@/lib/learning-cache";

const MONTH_PATTERN = /^(january|february|march|april|may|june|july|august|september|october|november|december)\b/i;
const TERM_PATTERN = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}|Life Task|Apprenticeship(?:\s+Phase)?|Mastery|Inside|Coquette|Cosmic Sublime|Tactical hell)\b/g;

export interface CourseGenInput {
  title?: string;
  author?: string;
  category?: string;
  sourceText: string;
}

function firstNonEmptyLine(text: string) {
  return text.split(/\r?\n/).map((l) => l.trim()).find(Boolean) || "Untitled Course";
}

function extractTitle(text: string, fallback?: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const titleLine = lines.find((line) => /^title\s*:/i.test(line));
  if (titleLine) return titleLine.replace(/^title\s*:\s*/i, "");
  const h1 = lines.find((line) => /^#\s+/.test(line));
  if (h1) return h1.replace(/^#\s+/, "");
  return fallback || firstNonEmptyLine(text);
}

function looksLikeHeading(line: string) {
  return MONTH_PATTERN.test(line)
    || /^chapter\s*\d+/i.test(line)
    || /^\d+[\.)]\s+/.test(line)
    || /^##\s+/.test(line)
    || /^final summary/i.test(line)
    || (/^[A-Z][^.!?]{3,90}$/.test(line) && line.split(" ").length <= 12);
}

function splitRealChapters(sourceText: string) {
  const lines = sourceText.split(/\r?\n/).map((l) => l.trim());
  const chapters: Array<{ title: string; content: string[] }> = [];
  let current: { title: string; content: string[] } | null = null;

  for (const line of lines) {
    if (!line) continue;
    if (looksLikeHeading(line)) {
      if (current && current.content.length) chapters.push(current);
      current = { title: line.replace(/^##\s+/, "").replace(/^\d+[\.)]\s*/, ""), content: [] };
      continue;
    }
    if (!current) current = { title: "Overview", content: [] };
    current.content.push(line);
  }
  if (current && current.content.length) chapters.push(current);

  return chapters.filter((c) => c.title && c.content.join(" ").length > 10);
}

function summarizeParagraphs(content: string[]) {
  const text = content.join(" ");
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return {
    summary: (sentences.slice(0, 2).join(" ") || text).slice(0, 220),
    teaching: [
      sentences.slice(0, 3).join(" "),
      sentences.slice(3, 6).join(" "),
      `Notice the pattern: this chapter rewards patience, social awareness, and repeated practice over flashy one-off performance.`,
    ].filter(Boolean).join("\n\n"),
  };
}

function chapterQuestionStyle(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("master") || lower.includes("inside")) return "conceptual";
  if (lower.includes("power") || lower.includes("outshine") || lower.includes("intelligence")) return "scenario";
  if (lower.includes("cosmic") || lower.includes("woolf")) return "reflective";
  return "mixed";
}

function buildQuestions(title: string, content: string[]): CourseQuestion[] {
  const style = chapterQuestionStyle(title);
  const source = content.join(" ");
  const fact = content[0] || "the chapter text";

  const baseMcPrompt = style === "scenario"
    ? `Scenario: A coworker feels threatened by your contribution. According to ${title}, what should you do first?`
    : `According to ${title}, what is the strongest guiding principle in this section?`;

  return [
    {
      type: "multiple_choice",
      prompt: baseMcPrompt,
      options: [
        "Map the power dynamics and adapt your delivery",
        "Push harder to prove superior intelligence",
        "Ignore context and focus only on output",
        "Publicly challenge authority",
      ],
      answer: "Map the power dynamics and adapt your delivery",
      explanation: `Supported by source section details: ${fact}`,
    },
    {
      type: "true_false",
      prompt: `${title} argues that mastery comes from long-term repetition and strategic patience.`,
      options: ["True", "False"],
      answer: "True",
      explanation: `The source repeatedly emphasizes progressive development and practice.`,
    },
    {
      type: "multiple_choice",
      prompt: `Which example best fits the lessons in ${title}?`,
      options: [
        "A disciplined apprenticeship with feedback",
        "Random trial and error without reflection",
        "Rushing to be recognized before building skill",
        "Avoiding difficult tasks to stay comfortable",
      ],
      answer: "A disciplined apprenticeship with feedback",
      explanation: `The section centers deliberate training, not impulsive visibility.`,
    },
    {
      type: "short_answer",
      prompt: style === "reflective"
        ? `In 3-4 sentences, connect ${title} to one moment in your life where you needed a wider perspective.`
        : `In 2-3 sentences, explain how you would apply ${title} this week at work or school.`,
      answer: "Open response",
      explanation: `Reference a concrete sentence from the source: ${source.slice(0, 160)}...`,
    },
  ];
}

function extractGlossary(sourceText: string): CourseGlossaryTerm[] {
  const matches = sourceText.match(TERM_PATTERN) || [];
  const counts = new Map<string, number>();
  for (const raw of matches) {
    const term = raw.trim();
    if (term.length < 3) continue;
    counts.set(term, (counts.get(term) || 0) + 1);
  }

  const topTerms = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([term]) => term);

  return topTerms.map((term) => ({
    term,
    definition: `In this source, ${term} refers to a recurring principle or character example used to teach strategic growth and mastery.`,
  }));
}

function buildObjectives(chapters: CourseChapter[]) {
  return chapters.slice(0, 5).map((chapter) => `Apply "${chapter.title}" by translating its main lesson into one concrete weekly behavior.`);
}

export function buildCourseFromSource(input: CourseGenInput): Omit<GeneratedCourse, "createdAt" | "updatedAt" | "courseId"> {
  const cleanSource = input.sourceText.trim();
  const parsedTitle = extractTitle(cleanSource, input.title);
  const title = parsedTitle || firstNonEmptyLine(cleanSource);
  const slug = slugifyTitle(title);
  const split = splitRealChapters(cleanSource);

  const chapters: CourseChapter[] = split.map((ch) => {
    const { summary, teaching } = summarizeParagraphs(ch.content);
    return {
      title: ch.title,
      summary,
      teaching,
      tryThis: `Try this: For the next 48 hours, run one deliberate experiment based on "${ch.title}" and log what changed.`,
      questions: buildQuestions(ch.title, ch.content),
    };
  });

  const finalQuiz = chapters.flatMap((c) => c.questions.filter((q) => q.type !== "short_answer").slice(0, 1)).slice(0, 10);

  return {
    slug,
    title,
    author: input.author,
    category: input.category,
    sourceText: cleanSource,
    objectives: buildObjectives(chapters),
    glossary: extractGlossary(cleanSource),
    chapters,
    finalQuiz,
    certificatesAwarded: 0,
    completionRewarded: false,
    completedSections: [],
  };
}
