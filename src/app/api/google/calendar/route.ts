import { NextResponse } from "next/server";
import { calendarEvents } from "@/lib/mock-data";

export async function GET() {
  // Deprecated: use /api/calendar instead
  return NextResponse.json({ events: calendarEvents });
}
