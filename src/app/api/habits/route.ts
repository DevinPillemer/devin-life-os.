import { NextResponse } from "next/server";
import { habitsData } from "@/lib/mock-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("read") || lower.includes("study") || lower.includes("book")) return "book-open";
  if (lower.includes("gym") || lower.includes("workout") || lower.includes("exercise")) return "dumbbell";
  if (lower.includes("journal") || lower.includes("write")) return "pen-tool";
  if (lower.includes("sleep")) return "moon";
  if (lower.includes("water")) return "droplets";
  if (lower.includes("walk") || lower.includes("steps")) return "footprints";
  if (lower.includes("food") || lower.includes("sugar")) return "apple";
  return "brain";
}

async function fetchFromHabitica() {
  const userId = process.env.HABITICA_USER_ID;
  const apiToken = process.env.HABITICA_API_TOKEN;
  if (!userId || !apiToken) return null;

  const res = await fetch("https://habitica.com/api/v3/tasks/user?type=dailys", {
    headers: { "x-api-user": userId, "x-api-key": apiToken },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Habitica fetch failed: ${res.status}`);
  const json = await res.json();
  const allDailies = (json.data || []).filter((d: any) => !d.isDue || !d.isDeleted);

  const habits = allDailies.map((d: any) => ({
    id: d.id,
    name: d.text,
    done: Boolean(d.completed),
    points: Math.max(1, Math.round((d.priority || 1) * 5)),
    icon: getIcon(d.text || ""),
    streak: d.streak || 0,
  }));

  return habits;
}

async function fetchFromHabitify() {
  const apiKey = process.env.HABITIFY_API_KEY;
  if (!apiKey) return null;

  const baseUrl = "https://api.habitify.me";
  const headers = { Authorization: apiKey };

  const habitsRes = await fetch(`${baseUrl}/habits`, { headers, cache: "no-store" });
  if (!habitsRes.ok) throw new Error("Habitify habits fetch failed");
  const habitsJson = await habitsRes.json();
  const habitsList = habitsJson.data || [];

  const today = new Date().toISOString().split("T")[0];
  const logsRes = await fetch(`${baseUrl}/logs?target_date=${today}T00:00:00+00:00`, { headers, cache: "no-store" });
  if (!logsRes.ok) throw new Error("Habitify logs fetch failed");
  const logsJson = await logsRes.json();
  const logs = logsJson.data || [];

  const completedIds = new Set(logs.filter((l: any) => l.value && l.value.type === "checked").map((l: any) => l.habit_id));

  return habitsList.filter((h: any) => !h.archived).map((h: any) => ({
    id: h.id,
    name: h.name,
    done: completedIds.has(h.id),
    points: h.goal?.value || 5,
    icon: getIcon(h.name || ""),
    streak: h.streak?.current || 0,
  }));
}

export async function GET() {
  try {
    const habits = (await fetchFromHabitica()) || (await fetchFromHabitify());
    if (!habits) {
      return NextResponse.json({
        ...habitsData,
        lastSynced: new Date().toISOString(),
        budgetCheckDone: false,
        warning: "No credentials configured",
      });
    }

    const pointsEarned = habits.filter((h: any) => h.done).reduce((s: number, h: any) => s + (h.points || 0), 0);
    const pointsTotal = habits.reduce((s: number, h: any) => s + (h.points || 0), 0);
    const budgetCheckDone = habits.some((h: any) => h.done && String(h.name).toLowerCase().includes("budget check"));

    return NextResponse.json({
      completed: habits.filter((h: any) => h.done).length,
      total: habits.length,
      pointsEarned,
      pointsTotal,
      budgetCheckDone,
      lastSynced: new Date().toISOString(),
      habits,
    });
  } catch (e) {
    console.error("Habits API error:", e);
    return NextResponse.json({ ...habitsData, lastSynced: new Date().toISOString(), budgetCheckDone: false });
  }
}
