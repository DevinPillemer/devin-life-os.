import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const port = 4010;
const sourceText = await readFile(new URL("../tests/fixtures/daily-laws-sample.txt", import.meta.url), "utf8");

const dev = spawn("npm", ["run", "dev", "--", "-p", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NODE_ENV: "development" },
});

let ready = false;
const readyPromise = new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error("dev server did not start in time")), 60000);
  const onData = (chunk) => {
    const text = chunk.toString();
    if (text.includes("Ready") || text.includes("ready")) {
      ready = true;
      clearTimeout(timer);
      resolve(true);
    }
  };
  dev.stdout.on("data", onData);
  dev.stderr.on("data", onData);
  dev.on("exit", (code) => {
    if (!ready) {
      clearTimeout(timer);
      reject(new Error(`dev server exited early with code ${code}`));
    }
  });
});

try {
  await readyPromise;
  const res = await fetch(`http://127.0.0.1:${port}/api/learning/generate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ summaryText: sourceText }),
  });
  const json = await res.json();

  assert.equal(res.status, 200, JSON.stringify(json));
  assert.equal(json?.course?.slug, "the-daily-laws-by-robert-greene");
  assert.ok(json?.course?.chapters?.length >= 4 && json?.course?.chapters?.length <= 7);
  const chapterTitles = json.course.chapters.map((c) => c.title).join(" ");
  assert.ok(/power|outshine|rational|life task|social/i.test(chapterTitles), `Unexpected chapter titles: ${chapterTitles}`);
  assert.ok((json?.course?.finalQuiz || []).length >= 5 && (json?.course?.finalQuiz || []).length <= 8);
  assert.ok(!/topic\s+\d+/i.test(chapterTitles), `Found stub chapter title in: ${chapterTitles}`);

  console.log("daily-laws generator assertions passed", {
    slug: json.course.slug,
    chapters: json.course.chapters.length,
    chapter0: json.course.chapters[0].title,
    chapterTitles: json.course.chapters.map((ch) => ch.title),
  });
} finally {
  dev.kill("SIGTERM");
}
