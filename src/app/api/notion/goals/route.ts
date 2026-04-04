import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.NOTION_API_KEY || !process.env.NOTION_GOALS_DB_ID) {
      return NextResponse.json(
        { error: "Notion API not configured. Set NOTION_API_KEY and NOTION_GOALS_DB_ID." },
        { status: 503 }
      );
    }

    const res = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_GOALS_DB_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sorts: [{ property: "Progress", direction: "descending" }],
        }),
      }
    );

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: "Failed to fetch goals", details: error }, { status: res.status });
    }

    const data = await res.json();

    // Map Notion results to our Goal type
    const goals = data.results.map((page: any) => ({
      id: page.id,
      name: page.properties?.Name?.title?.[0]?.plain_text || "Untitled",
      category: page.properties?.Category?.select?.name || "Uncategorized",
      status: page.properties?.Status?.status?.name || "Not Started",
      progress: page.properties?.Progress?.number || 0,
      creditValue: page.properties?.["Credit Value"]?.number || 0,
    }));

    return NextResponse.json(goals);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
