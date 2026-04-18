import { NextRequest, NextResponse } from "next/server";
import { notionGoals } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.NOTION_API_KEY;
    const dbId = process.env.NOTION_GOALS_DB_ID;
    if (!apiKey || !dbId) throw new Error("No Notion credentials");

    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: { property: "Status", status: { does_not_equal: "Completed" } },
      }),
    });

    if (!res.ok) throw new Error("Notion goals fetch failed");
    const data = await res.json();

    const goals = (data.results || []).map((page: any) => {
      const props = page.properties;
      const title = props.Title?.title?.[0]?.plain_text || props.Name?.title?.[0]?.plain_text || "Untitled";
      const percent = props.Progress?.number || 0;
      const category = props.Category?.select?.name?.toUpperCase() || "PROJECT";
      const due = props.DueDate?.date?.start || props.Deadline?.date?.start || "";
      return { title, percent, category, due };
    });

    goals.sort((a: any, b: any) => {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return new Date(a.due).getTime() - new Date(b.due).getTime();
    });

    return NextResponse.json({ active: goals.length, totalCompleted: 0, goals, lastSynced: new Date().toISOString() });
  } catch (e) {
    console.error("Goals API error:", e);
    return NextResponse.json({ ...notionGoals, lastSynced: new Date().toISOString() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.NOTION_API_KEY;
    const dbId = process.env.NOTION_GOALS_DB_ID;
    if (!apiKey || !dbId) return NextResponse.json({ ok: false, message: "Notion is not configured" }, { status: 400 });

    const body = await req.json();
    const title = String(body.title || "").trim();
    if (!title) return NextResponse.json({ ok: false, message: "Title is required" }, { status: 400 });

    const notionBody = {
      parent: { database_id: dbId },
      properties: {
        Title: { title: [{ text: { content: title } }] },
        Category: { select: { name: body.category || "PROJECT" } },
        Priority: { select: { name: body.priority || "Medium" } },
      },
    };

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notionBody),
    });

    if (!response.ok) {
      const msg = await response.text();
      return NextResponse.json({ ok: false, message: msg }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message || "Failed to create goal" }, { status: 500 });
  }
}
