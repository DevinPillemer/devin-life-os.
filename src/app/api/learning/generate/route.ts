import { NextRequest, NextResponse } from "next/server";

const VALUES = ["growth", "family", "faith", "financial freedom", "health", "leadership"];

function buildPrompt(seed: string) {
  return `You are building a practical learning course from source material.\nPersonal values to align with: ${VALUES.join(", ")}.\nInput: ${seed}\n\nReturn strict JSON with this shape:\n{\n  "title": "string",\n  "modules": [\n    {\n      "title": "string",\n      "keyConcepts": ["string"],\n      "questions": [\n        {\n          "question": "string",\n          "options": ["A","B","C","D"],\n          "correctIndex": 0,\n          "explanation": "string"\n        }\n      ]\n    }\n  ],\n  "finalQuiz": [same question shape]\n}\nRules: create 4-6 modules, each with 5-10 questions, and 6 final quiz questions.`;
}

export async function POST(req: NextRequest) {
  try {
    const { seed } = await req.json();
    if (!seed) return NextResponse.json({ ok: false, message: "seed is required" }, { status: 400 });

    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    let raw = "";

    if (openaiKey) {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          temperature: 0.4,
          messages: [{ role: "user", content: buildPrompt(seed) }],
          response_format: { type: "json_object" },
        }),
      });
      if (!resp.ok) throw new Error(`OpenAI failed: ${await resp.text()}`);
      const data = await resp.json();
      raw = data.choices?.[0]?.message?.content || "{}";
    } else if (anthropicKey) {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-latest",
          max_tokens: 4000,
          temperature: 0.4,
          messages: [{ role: "user", content: buildPrompt(seed) }],
        }),
      });
      if (!resp.ok) throw new Error(`Anthropic failed: ${await resp.text()}`);
      const data = await resp.json();
      raw = data.content?.[0]?.text || "{}";
    } else {
      return NextResponse.json({ ok: false, message: "No AI API key configured" }, { status: 400 });
    }

    const parsed = JSON.parse(raw);
    return NextResponse.json({ ok: true, course: parsed, values: VALUES });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message || "Generation failed" }, { status: 500 });
  }
}
