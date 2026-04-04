import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON || !process.env.GOOGLE_CALENDAR_ID) {
      return NextResponse.json(
        { error: "Google Calendar API not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON and GOOGLE_CALENDAR_ID." },
        { status: 503 }
      );
    }

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    // Get access token (same pattern as Sheets)
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: createJWT(credentials),
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.json({ error: "Google auth failed" }, { status: 401 });
    }

    const { access_token } = await tokenRes.json();

    // Fetch today's events
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(process.env.GOOGLE_CALENDAR_ID)}/events?` +
        `timeMin=${startOfDay}&timeMax=${endOfDay}&singleEvents=true&orderBy=startTime&maxResults=10`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    if (!calRes.ok) {
      return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: calRes.status });
    }

    const data = await calRes.json();
    const events = (data.items || []).map((event: any) => ({
      id: event.id,
      title: event.summary || "Untitled",
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      color: event.colorId || "#14b8a6",
    }));

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function createJWT(credentials: any): string {
  // Placeholder — use google-auth-library in production
  return "placeholder-jwt";
}
