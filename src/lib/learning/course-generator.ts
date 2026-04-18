import { CourseChapter, CourseGlossaryTerm, CourseQuestion, GeneratedCourse, slugifyTitle } from "@/lib/learning-cache";

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

function cleanLine(line: string) {
  return line.replace(/^[-*]\s+/, "").replace(/^\d+[\.)]\s+/, "").trim();
}

function isHeadingLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^#{1,4}\s+/.test(trimmed)) return true;
  if (/^blink\s*\d*\b/i.test(trimmed)) return true;
  if (/^chapter\s+\d+\b/i.test(trimmed)) return true;
  if (/^\d+[\.)]\s+/.test(trimmed)) return true;
  if (/^(january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(trimmed)) return true;

  const looksTitleCase = /^[A-Z][A-Za-z0-9'’,:;()\-\s]{4,100}$/.test(trimmed);
  const sentenceLike = /[.!?]$/.test(trimmed);
  return looksTitleCase && !sentenceLike && trimmed.split(/\s+/).length <= 14;
}

function wordsCount(text: string) {
  return (text.trim().match(/\S+/g) || []).length;
}

function splitByDetectedHeadings(lines: string[]) {
  const chapters: Array<{ title: string; content: string[] }> = [];
  let current: { title: string; content: string[] } | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (isHeadingLine(line)) {
      if (current && current.content.length) chapters.push(current);
      current = { title: cleanLine(line.replace(/^#{1,4}\s+/, "")), content: [] };
      continue;
    }
    if (!current) current = { title: "Introduction", content: [] };
    current.content.push(cleanLine(line));
  }

  if (current && current.content.length) chapters.push(current);
  return chapters;
}

function splitParagraphClusters(sourceText: string) {
  const paragraphs = sourceText
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const clusters: Array<{ title: string; content: string[] }> = [];
  let bucket: string[] = [];
  let idx = 1;

  const pushBucket = () => {
    if (!bucket.length) return;
    const combined = bucket.join(" ");
    clusters.push({
      title: `Section ${idx}: ${combined.split(/(?<=[.!?])\s+/)[0].slice(0, 72)}`,
      content: [...bucket],
    });
    bucket = [];
    idx += 1;
  };

  for (const paragraph of paragraphs) {
    bucket.push(paragraph);
    const wc = wordsCount(bucket.join(" "));
    if (wc >= 220) pushBucket();
  }
  pushBucket();
  return clusters;
}

function condenseToRange(chapters: Array<{ title: string; content: string[] }>, min = 4, max = 7) {
  const filtered = chapters.filter((ch) => wordsCount(ch.content.join(" ")) >= 40);
  if (filtered.length < min) return filtered;
  if (filtered.length <= max) return filtered;

  const target = max;
  const merged: Array<{ title: string; content: string[] }> = [];
  const size = Math.ceil(filtered.length / target);
  for (let i = 0; i < filtered.length; i += size) {
    const chunk = filtered.slice(i, i + size);
    merged.push({
      title: chunk.map((c) => c.title).join(" + "),
      content: chunk.flatMap((c) => c.content),
    });
  }
  return merged.slice(0, max);
}

function splitSentences(text: string) {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

function chapterSummary(content: string[]) {
  const sentences = splitSentences(content.join(" "));
  return sentences.slice(0, 5).join(" ");
}

function chapterTakeaways(content: string[]) {
  const sentences = splitSentences(content.join(" "));
  const selected = sentences.filter((s) => wordsCount(s) >= 8).slice(0, 4);
  return selected.map((s) => `• ${s}`).join("\n");
}

function chapterQuestions(title: string, content: string[]): CourseQuestion[] {
  const sentences = splitSentences(content.join(" "));
  const anchorA = sentences[0] || content[0] || "this chapter";
  const anchorB = sentences[Math.min(2, Math.max(sentences.length - 1, 0))] || anchorA;

  return [
    {
      type: "short_answer",
      prompt: `In your own words, what is the core claim of \"${title}\" and why does it matter?`,
      answer: anchorA,
      explanation: "A strong answer should reference a concrete argument from this chapter.",
    },
    {
      type: "short_answer",
      prompt: `Which example in \"${title}\" changed your thinking the most, and what action follows from it this week?`,
      answer: anchorB,
      explanation: "Your response should include one chapter-specific example and one practical application.",
    },
    {
      type: "short_answer",
      prompt: `What would someone misunderstand if they skimmed \"${title}\" too quickly?`,
      answer: `${anchorA} ${anchorB}`,
      explanation: "Clarify nuance and mention at least one detail from the chapter text.",
    },
  ];
}

function buildFinalQuiz(chapters: CourseChapter[]): CourseQuestion[] {
  const questions: CourseQuestion[] = [];

  chapters.forEach((chapter, idx) => {
    if (questions.length >= 8) return;
    const summarySentences = splitSentences(chapter.summary);
    const correct = summarySentences[0] || chapter.summary;
    const distractorA = summarySentences[1] || `${chapter.title} argues for quick wins over consistency.`;
    const distractorB = chapters[(idx + 1) % chapters.length]?.summary || "The text rejects strategic planning.";
    const distractorC = "The chapter says context never matters.";

    const options = [correct, distractorA, distractorB, distractorC]
      .map((opt) => opt.slice(0, 120))
      .filter(Boolean)
      .slice(0, 4);

    questions.push({
      type: "multiple_choice",
      prompt: `Which statement best reflects the chapter \"${chapter.title}\"?`,
      options,
      answer: options[0],
      explanation: `This answer mirrors the chapter's own summary and examples in \"${chapter.title}\".`,
    });
  });

  return questions.slice(0, Math.max(5, Math.min(8, questions.length)));
}

function extractGlossary(sourceText: string): CourseGlossaryTerm[] {
  const titleTerms = Array.from(new Set(
    sourceText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(isHeadingLine)
      .map((line) => cleanLine(line.replace(/^#{1,4}\s+/, "")))
      .filter(Boolean),
  )).slice(0, 10);

  if (!titleTerms.length) {
    return [
      { term: "Core thesis", definition: "The primary argument repeated throughout the source material." },
      { term: "Case example", definition: "A concrete illustration used to make an abstract idea practical." },
      { term: "Application", definition: "How to use the source's lesson in real decisions." },
    ];
  }

  return titleTerms.map((term) => ({
    term,
    definition: `A major concept or section from the source that structures the course narrative: ${term}.`,
  }));
}

function buildObjectives(chapters: CourseChapter[]) {
  return chapters.slice(0, 5).map((chapter) => `Explain and apply the key lesson from \"${chapter.title}\" using one concrete example from the source.`);
}

export function buildCourseFromSource(input: CourseGenInput): Omit<GeneratedCourse, "createdAt" | "updatedAt" | "courseId"> {
  const cleanSource = input.sourceText.trim();
  const parsedTitle = extractTitle(cleanSource, input.title);
  const title = parsedTitle || firstNonEmptyLine(cleanSource);
  const slug = slugifyTitle(title);

  const lines = cleanSource.split(/\r?\n/);
  const headingChapters = splitByDetectedHeadings(lines);
  const baseChapters = headingChapters.length >= 4 ? headingChapters : splitParagraphClusters(cleanSource);
  const ranged = condenseToRange(baseChapters, 4, 7);

  if (ranged.length < 4) {
    throw new Error("Could not detect enough real chapter boundaries from the provided text. Please paste a longer or more structured summary.");
  }

  const chapters: CourseChapter[] = ranged.map((ch) => ({
    title: ch.title,
    summary: chapterSummary(ch.content),
    teaching: chapterTakeaways(ch.content),
    tryThis: `Apply \"${ch.title}\" in one decision this week and journal what changed.`,
    questions: chapterQuestions(ch.title, ch.content).slice(0, 3),
  }));

  const finalQuiz = buildFinalQuiz(chapters);
  if (finalQuiz.length < 5) {
    throw new Error("Could not generate a full end-of-course quiz from this text. Please provide more content.");
  }

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
