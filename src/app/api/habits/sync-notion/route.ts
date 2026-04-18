import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const apiKey = process.env.NOTION_API_KEY;
    const dbId = process.env.NOTION_HABITS_DB_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!apiKey || !dbId) {
      return NextResponse.json({ ok: false, message: "NOTION_API_KEY or NOTION_HABITS_DB_ID missing" }, { status: 400 });
    }

    const habitsRes = await fetch(`${appUrl}/api/habits`, { cache: "no-store" });
    const habitsData = await habitsRes.json();

    const payload = {
      parent: { database_id: dbId },
      properties: {
        Name: { title: [{ text: { content: `Habits Sync ${new Date().toISOString().split("T")[0]}` } }] },
        Date: { date: { start: new Date().toISOString() } },
        Score: { number: habitsData.pointsEarned || 0 },
        Completed: { number: habitsData.completed || 0 },
        Total: { number: habitsData.total || 0 },
      },
      children: [
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: (habitsData.habits || [])
                    .filter((h: any) => h.done)
                    .map((h: any) => `✅ ${h.name}`)
                    .join("\n") || "No completed habits",
                },
              },
            ],
          },
        },
      ],
    };

    const notionRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!notionRes.ok) {
      const errText = await notionRes.text();
      return NextResponse.json({ ok: false, message: errText }, { status: 500 });
    }

    return NextResponse.json({ ok: true, syncedAt: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message || "Sync failed" }, { status: 500 });
  }
}
