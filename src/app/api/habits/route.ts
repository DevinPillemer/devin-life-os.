import { NextResponse } from "next/server";
import { habitsData } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.HABITIFY_API_KEY;
    if (!apiKey) throw new Error("No Habitify API key");

    const baseUrl = "https://api.habitify.me";
    const headers = { Authorization: apiKey };

    // Fetch habits list
    const habitsRes = await fetch(`${baseUrl}/habits`, { headers });
    if (!habitsRes.ok) throw new Error("Habitify habits fetch failed");
    const habitsJson = await habitsRes.json();
    const habitsList = habitsJson.data || [];

    // Fetch today's logs
    const today = new Date().toISOString().split("T")[0];
    const logsRes = await fetch(
      `${baseUrl}/logs?target_date=${today}T00:00:00+00:00`,
      { headers }
    );
    if (!logsRes.ok) throw new Error("Habitify logs fetch failed");
    const logsJson = await logsRes.json();
    const logs = logsJson.data || [];

    const completedIds = new Set(
      logs
        .filter((l: any) => l.value && l.value.type === "checked")
        .map((l: any) => l.habit_id)
    );

    let pointsEarned = 0;
    let pointsTotal = 0;
    const habits = habitsList.map((h: any) => {
      const done = completedIds.has(h.id);
      const points = h.goal?.value || 5;
      pointsTotal += points;
      if (done) pointsEarned += points;

      return {
        id: h.id,
        name: h.name,
        done,
        points,
        icon: "brain",
        streak: h.streak?.current || 0,
      };
    });

    return NextResponse.json({
      completed: habits.filter((h: any) => h.done).length,
      total: habits.length,
      pointsEarned,
      pointsTotal,
      habits,
    });
  } catch (e) {
    console.error("Habits API error:", e);
    return NextResponse.json(habitsData);
  }
}
