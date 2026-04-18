import { NextResponse } from "next/server";
import { calendarEvents } from "@/lib/mock-data";
import { getGoogleAuth } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const auth = await getGoogleAuth();
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!auth || !calendarId) {
      return NextResponse.json({ events: [], warning: "No credentials configured" });
    }

    const { google } = await import("googleapis");
    const calendar = google.calendar({ version: "v3", auth: auth as any });

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const res = await calendar.events.list({
      calendarId,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 20,
    });

    const colors = ["#14b8a6", "#8b5cf6", "#f59e0b", "#ef4444", "#22c55e", "#ec4899"];
    const events = (res.data.items || []).map((evt: any, i: number) => {
      const start = evt.start?.dateTime || evt.start?.date || "";
      const end = evt.end?.dateTime || evt.end?.date || "";
      const startTime = start.includes("T")
        ? new Date(start).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
        : "00:00";
      const endTime = end.includes("T")
        ? new Date(end).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
        : "23:59";

      return {
        title: evt.summary || "Untitled",
        start: startTime,
        end: endTime,
        color: evt.colorId ? colors[parseInt(evt.colorId) % colors.length] : colors[i % colors.length],
      };
    });

    return NextResponse.json({ events });
  } catch (e) {
    console.error("Calendar API error:", e);
    return NextResponse.json({ events: calendarEvents, warning: "Calendar service unavailable; using fallback events" });
  }
}
