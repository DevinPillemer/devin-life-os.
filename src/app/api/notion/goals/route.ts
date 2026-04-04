import { NextResponse } from "next/server";
import { notionGoals } from "@/lib/mock-data";

export async function GET() {
  // TODO: Replace with real Notion API call
  // const notion = new Client({ auth: process.env.NOTION_TOKEN });
  // const response = await notion.databases.query({ database_id: process.env.NOTION_GOALS_DB });
  return NextResponse.json(notionGoals);
}
