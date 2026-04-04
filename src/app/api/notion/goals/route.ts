import { NextResponse } from "next/server";
import { notionGoals } from "@/lib/mock-data";

export async function GET() {
  // Deprecated: use /api/goals instead
  return NextResponse.json(notionGoals);
}
