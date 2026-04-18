import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { GeneratedCourse, getCourseByKey, saveCourse } from "@/lib/learning-cache";

const VALUES = ["growth", "family", "faith", "financial freedom", "health", "leadership"];

function topicQuizStyle(category = "") {
  const c = category.toLowerCase();
  if (c.includes("lead")) return "Prioritize scenario-based leadership decisions and Both-And tradeoffs.";
  if (c.includes("philos")) return "Prioritize conceptual and argument-analysis questions.";
  if (c.includes("finance")) return "Include numerical and practical money-application questions.";
  return "Blend conceptual, practical, and scenario questions.";
}

function splitChapters(input: string) {
  const lines = input.split(/\r?\n/).map((l) => l.trim());
  const chapters: Array<{ title: string; body: string }> = [];
  let current: { title: string; body: string[] } | null = null;

  for (const line of lines) {
    if (!line) continue;
    if (/^(chapter\s*\d+|\d+[\).]|final summary|summary|key idea|blink\s*\d+)/i.test(line) || /^[A-Z][^.!?]{4,80}$/.test(line)) {
      if (current) chapters.push({ title: current.title, body: current.body.join("\n") });
      current = { title: line.replace(/^\d+[\).]\s*/, ""), body: [] };
    } else if (current) {
      current.body.push(line);
    }
  }
  if (current) chapters.push({ title: current.title, body: current.body.join("\n") });
  return chapters.length ? chapters : [{ title: "Main Ideas", body: input }];
}

function promptForCourse({ title, author, category, sourceText }: { title: string; author?: string; category?: string; sourceText: string }) {
  const chapterHints = splitChapters(sourceText).map((c) => c.title).join(", ");
  return `Create a deeply tailored chapter-by-chapter course.
Book: ${title}${author ? ` by ${author}` : ""}
Category: ${category || "General"}
User values (soft context only): ${VALUES.join(", ")}
Inferred chapter headings: ${chapterHints}
Quiz style directive: ${topicQuizStyle(category)}

SOURCE TEXT START
${sourceText}
SOURCE TEXT END

Return strict JSON with this exact schema:
{
  "title": "string",
  "chapters": [
    {
      "title": "string",
      "learn": [
        {"concept":"bold term words", "explanation":"teach the concept from source", "example":"concrete source-grounded example"}
      ],
      "reflect": ["open ended question", "open ended question"],
      "optionalValueReflection": "single optional question tied to one user value",
      "quiz": [
        {"type":"multiple_choice|scenario|true_false","question":"string","options":["..."],"correctAnswer":"string","explanation":"reference source chapter details"}
      ]
    }
  ]
}
Rules:
- Preserve chapter structure from source.
- Each chapter needs 4-6 learn items, 1-2 reflect questions, 5 quiz questions.
- No boilerplate. No generic summaries. Teach with source-grounded detail.
- For true_false, include two options exactly: ["True","False"].`;
}

async function callModel(prompt: string) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (anthropicKey) {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 8000,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!resp.ok) throw new Error(`Anthropic failed: ${await resp.text()}`);
    const data = await resp.json();
    return data.content?.[0]?.text || "{}";
  }

  if (openaiKey) {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!resp.ok) throw new Error(`OpenAI failed: ${await resp.text()}`);
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || "{}";
  }

  throw new Error("No AI API key configured");
}

function parseJson(raw: string) {
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
  const cleaned = fenced ? fenced[1] : raw;
  return JSON.parse(cleaned);
}

export async function POST(req: NextRequest) {
  try {
    const { bookId = "ad-hoc", title = "Custom Course", author, category, summaryText, seed, regenerate } = await req.json();
    const sourceText = (summaryText || seed || "").trim();
    if (!sourceText && !title) return NextResponse.json({ ok: false, message: "summaryText or title is required" }, { status: 400 });

    const hash = crypto.createHash("sha256").update(`${bookId}|${title}|${author || ""}|${category || ""}|${sourceText}`).digest("hex").slice(0, 16);
    const cacheKey = `${bookId}:${hash}`;

    if (!regenerate) {
      const cached = getCourseByKey(cacheKey);
      if (cached) return NextResponse.json({ ok: true, course: cached, cached: true });
    }

    const prompt = promptForCourse({ title, author, category, sourceText: sourceText || `Generate seed course for ${title} by ${author || "Unknown"}.` });
    const raw = await callModel(prompt);
    const parsed = parseJson(raw);

    const course: GeneratedCourse = {
      courseId: `${bookId}-${Date.now()}`,
      bookId,
      title: parsed.title || title,
      author,
      category,
      chapters: parsed.chapters || [],
    };

    saveCourse(cacheKey, course);
    return NextResponse.json({ ok: true, course, cached: false });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message || "Generation failed" }, { status: 500 });
  }
}
