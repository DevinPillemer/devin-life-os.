import { NextResponse } from "next/server";
import { sleepData } from "@/lib/mock-data";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SLEEP_FILE = path.join(process.cwd(), ".sleep-data.json");

async function readSleepCache() {
  try {
    const data = await fs.readFile(SLEEP_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function writeSleepCache(data: any) {
  await fs.writeFile(SLEEP_FILE, JSON.stringify(data, null, 2));
}

// GET: return cached sleep data
export async function GET() {
  try {
    const cached = await readSleepCache();
    if (cached) return NextResponse.json(cached);
    return NextResponse.json(sleepData);
  } catch (e) {
    console.error("Sleep GET error:", e);
    return NextResponse.json(sleepData);
  }
}

// POST: receive nightly push from iOS Shortcut
export async function POST(request: Request) {
  try {
    const secret = process.env.APPLE_HEALTH_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ success: false, warning: "No credentials configured" });
    }

    const headerSecret = request.headers.get("X-Health-Secret");
    if (headerSecret !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = {
      duration: body.duration || 0,
      bedtime: body.bedtime || "",
      wakeTime: body.wakeTime || "",
      quality: body.quality || "unknown",
      deepSleep: body.deepSleep || 0,
      streak: body.streak || 0,
      updatedAt: new Date().toISOString(),
    };

    await writeSleepCache(data);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Sleep POST error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
