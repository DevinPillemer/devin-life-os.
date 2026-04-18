import { NextRequest, NextResponse } from "next/server";
import { buildCourseFromSource } from "@/lib/learning/course-generator";
import { CourseQuestion, GeneratedCourse, slugifyTitle, upsertCourse } from "@/lib/learning-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface LlmShape {
  title: string;
  objectives: string[];
  glossary: Array<{ term: string; definition: string }>;
  chapters: Array<{ title: string; summary: string; teaching: string; tryThis: string; questions: CourseQuestion[] }>;
  finalQuiz: CourseQuestion[];
}

function parseJson(raw: string) {
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
  return JSON.parse(fenced ? fenced[1] : raw);
}

function validateShape(parsed: any): parsed is LlmShape {
  return !!parsed
    && typeof parsed.title === "string"
    && Array.isArray(parsed.objectives)
    && Array.isArray(parsed.glossary)
    && Array.isArray(parsed.chapters)
    && parsed.chapters.every((ch: any) => typeof ch.title === "string" && Array.isArray(ch.questions))
    && Array.isArray(parsed.finalQuiz);
}

function hasStubContent(parsed: LlmShape) {
  const chapterTitles = (parsed.chapters || []).map((ch) => String(ch.title || "").toLowerCase());
  return chapterTitles.some((title) => /^topic\s*\d+/.test(title) || title === "overview");
}

function llmPrompt(sourceText: string, title?: string, author?: string, category?: string) {
  return `You are generating a serious learning course from source text.
Return STRICT JSON ONLY with this exact shape:
{"title":"...","objectives":["..."],"glossary":[{"term":"...","definition":"..."}],"chapters":[{"title":"...","summary":"...","teaching":"2-4 paragraphs with concrete anecdotes from source","tryThis":"...","questions":[{"type":"multiple_choice|true_false|short_answer","prompt":"...","options":["..."],"answer":"...","explanation":"must cite source details"}]}],"finalQuiz":[{"type":"multiple_choice|true_false|short_answer","prompt":"...","options":["..."],"answer":"...","explanation":"..."}]}
Hard requirements:
- Use REAL chapter boundaries from source: month names, numbered headings, "Chapter N", markdown headings, blank separated sections, and "Final summary".
- Do not output placeholder chapter names like Topic 1.
- Provide 3-5 questions per chapter with mixed types; MC must have exactly 4 options and exactly one correct answer.
- Questions must be section-specific with answer explanations anchored to source text.
- Ensure title is never undefined.
Context:
Title hint: ${title || ""}
Author hint: ${author || ""}
Category hint: ${category || ""}
Full source text:
${sourceText}`;
}

async function callModel(prompt: string) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return null;

  const model = process.env.LEARNING_MODEL || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI failed: ${errorText}`);
  }

  const data = await res.json();
  const inTokens = data.usage?.prompt_tokens ?? 0;
  const outTokens = data.usage?.completion_tokens ?? 0;
  console.log(`[learning.generate] model=${model} tokens_in=${inTokens} tokens_out=${outTokens}`);
  return data.choices?.[0]?.message?.content || null;
}

async function generateWithRetry(sourceText: string, title?: string, author?: string, category?: string) {
  const prompt = llmPrompt(sourceText, title, author, category);
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await callModel(prompt);
    if (!raw) return null;
    try {
      const parsed = parseJson(raw);
      if (validateShape(parsed)) return parsed;
    } catch {
      // retry once
    }
  }
  throw new Error("Model returned invalid course JSON. Please retry with clearer source text.");
}

export async function POST(req: NextRequest) {
  try {
    const { title, author, category, summaryText, seed, regenerate } = await req.json();
    const sourceText = String(summaryText || seed || "").trim();
    if (!sourceText) return NextResponse.json({ ok: false, message: "summaryText is required" }, { status: 400 });

    const fallbackBase = buildCourseFromSource({ title, author, category, sourceText });

    let base = fallbackBase;
    if (process.env.OPENAI_API_KEY) {
      const llm = await generateWithRetry(sourceText, title, author, category);
      if (llm && !hasStubContent(llm) && llm.chapters.length >= 4 && llm.chapters.length <= 7) {
        base = {
          ...fallbackBase,
          title: llm.title || fallbackBase.title,
          slug: slugifyTitle(llm.title || fallbackBase.title),
          objectives: llm.objectives,
          glossary: llm.glossary,
          chapters: llm.chapters,
          finalQuiz: llm.finalQuiz?.slice(0, 10) || fallbackBase.finalQuiz,
        };
      } else {
        console.warn("[learning.generate] ignoring LLM response due to stub/shape mismatch");
      }
    }

    const course: GeneratedCourse = await upsertCourse({
      ...base,
      slug: base.slug,
      courseId: regenerate ? undefined : undefined,
    });

    return NextResponse.json({
      ok: true,
      course,
      llmEnhanced: !!process.env.OPENAI_API_KEY,
      warning: process.env.OPENAI_API_KEY ? undefined : "LLM key missing; returned rule-based course.",
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message || "Generation failed" }, { status: 500 });
  }
}
