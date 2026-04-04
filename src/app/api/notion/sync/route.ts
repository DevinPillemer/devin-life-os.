import { NextResponse } from "next/server";

export async function POST() {
  try {
    if (!process.env.NOTION_API_KEY || !process.env.NOTION_GOALS_DB_ID) {
      return NextResponse.json(
        { error: "Notion API not configured." },
        { status: 503 }
      );
    }

    // Fetch all goals from Notion
    const res = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_GOALS_DB_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to sync with Notion" }, { status: res.status });
    }

    const data = await res.json();
    const count = data.results?.length || 0;

    return NextResponse.json({
      message: `Synced ${count} goals from Notion`,
      count,
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
