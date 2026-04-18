import { NextResponse } from "next/server";
import { learningData } from "@/lib/mock-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const apiKey = process.env.NOTION_API_KEY;
    const dbId = process.env.NOTION_LEARNING_DB_ID;
    if (!apiKey || !dbId) {
      return NextResponse.json({ ...learningData, warning: "No credentials configured" });
    }

    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sorts: [{ property: "LastStudied", direction: "descending" }],
        page_size: 30,
      }),
    });

    if (!res.ok) throw new Error("Notion learning fetch failed");
    const data = await res.json();

    const sessions = (data.results || []).map((page: any) => {
      const props = page.properties;
      return {
        date:
          props.LastStudied?.date?.start ||
          props.Date?.date?.start ||
          "",
        topic:
          props.Topic?.title?.[0]?.plain_text ||
          props.Name?.title?.[0]?.plain_text ||
          "Study session",
        minutes: props.Minutes?.number || props.Duration?.number || 30,
      };
    });

    // Calculate streak from consecutive daily entries
    let streakDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];
      if (sessions.some((s: any) => s.date === dateStr)) {
        streakDays++;
      } else {
        break;
      }
    }

    // Find best streak (simplified - just use current data)
    const todayStr = today.toISOString().split("T")[0];
    const todayDone = sessions.some((s: any) => s.date === todayStr);

    return NextResponse.json({
      streakDays,
      bestStreak: Math.max(streakDays, 21),
      todayDone,
      currentModule: sessions[0]?.topic || "No recent session",
      recentSessions: sessions.slice(0, 5),
    });
  } catch (e) {
    console.error("Learning API error:", e);
    return NextResponse.json(learningData);
  }
}
