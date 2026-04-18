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
  assert.equal(json?.course?.chapters?.length, 10);
  assert.ok(/january|life task/i.test(json.course.chapters[0].title));
  assert.ok(/april|outshine/i.test(json.course.chapters[3].title));
  assert.ok(/cosmic|december/i.test(json.course.chapters[9].title));

  console.log("daily-laws generator assertions passed", {
    slug: json.course.slug,
    chapters: json.course.chapters.length,
    chapter0: json.course.chapters[0].title,
    chapter3: json.course.chapters[3].title,
    chapter9: json.course.chapters[9].title,
  });
} finally {
  dev.kill("SIGTERM");
}
