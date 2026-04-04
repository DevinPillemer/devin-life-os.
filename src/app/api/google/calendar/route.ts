import { NextResponse } from "next/server";
import { calendarEvents } from "@/lib/mock-data";

export async function GET() {
  // TODO: Replace with real Google Calendar API call
  // const auth = new google.auth.GoogleAuth({ credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!) });
  // const calendar = google.calendar({ version: "v3", auth });
  return NextResponse.json({ events: calendarEvents });
}
