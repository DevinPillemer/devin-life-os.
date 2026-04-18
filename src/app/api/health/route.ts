import { NextResponse } from "next/server";
import { stravaData } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

async function getStravaToken(): Promise<string | null> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token;
}

const typeMap: Record<string, string> = {
  Run: "running",
  Ride: "cycling",
  WeightTraining: "gym",
  Swim: "swim",
  Walk: "walking",
  Hike: "hiking",
  Yoga: "yoga",
};

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
  try {
    const token = await getStravaToken();
    if (!token) throw new Error("No Strava token");

    const weekStart = getWeekStart();
    const twelveWeeksAgo = new Date(weekStart);
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 7 * 12);
    const afterUnix = Math.floor(twelveWeeksAgo.getTime() / 1000);

    const allActivities: any[] = [];
    for (let page = 1; page <= 4; page++) {
      const activitiesRes = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${afterUnix}&per_page=100&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!activitiesRes.ok) throw new Error("Strava activities fetch failed");
      const chunk = await activitiesRes.json();
      if (!Array.isArray(chunk) || chunk.length === 0) break;
      allActivities.push(...chunk);
      if (chunk.length < 100) break;
    }

    const thisWeek = allActivities.filter((a) => new Date(a.start_date).getTime() >= weekStart.getTime());
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeek = allActivities.filter((a) => {
      const t = new Date(a.start_date).getTime();
      return t >= lastWeekStart.getTime() && t < weekStart.getTime();
    });

    const totalKm = thisWeek.reduce((s, a) => s + (a.distance || 0) / 1000, 0);
    const totalMinutes = thisWeek.reduce((s, a) => s + (a.moving_time || 0) / 60, 0);
    const lastWeekKm = lastWeek.reduce((s, a) => s + (a.distance || 0) / 1000, 0);

    const weekChart = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      const dayStr = day.toISOString().split("T")[0];
      const dayActivities = thisWeek.filter((a) => a.start_date.split("T")[0] === dayStr);
      return {
        day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        km: Math.round(dayActivities.reduce((s, a) => s + (a.distance || 0) / 1000, 0) * 10) / 10,
        minutes: Math.round(dayActivities.reduce((s, a) => s + (a.moving_time || 0) / 60, 0)),
      };
    });

    const weeklyHistory = Array.from({ length: 12 }, (_, i) => {
      const start = new Date(weekStart);
      start.setDate(start.getDate() - (11 - i) * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const list = allActivities.filter((a) => {
        const t = new Date(a.start_date).getTime();
        return t >= start.getTime() && t < end.getTime();
      });
      return {
        weekOf: start.toISOString().split("T")[0],
        sessions: list.length,
        km: Math.round(list.reduce((s, a) => s + (a.distance || 0) / 1000, 0) * 10) / 10,
      };
    });

    const activities = thisWeek.slice(0, 10).map((a) => ({
      type: typeMap[a.type] || String(a.type || "other").toLowerCase(),
      label: a.name,
      km: Math.round(((a.distance || 0) / 1000) * 10) / 10,
      minutes: Math.round((a.moving_time || 0) / 60),
    }));

    return NextResponse.json({
      sessions: thisWeek.length,
      totalKm: Math.round(totalKm * 10) / 10,
      totalMinutes: Math.round(totalMinutes),
      weeklyGoal: { target: 5, completed: thisWeek.length },
      vsLastWeek: { kmDelta: Math.round((totalKm - lastWeekKm) * 10) / 10, sessionsDelta: thisWeek.length - lastWeek.length },
      weekChart,
      weeklyHistory,
      activities,
      lastSynced: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Health API error:", e);
    return NextResponse.json({ ...stravaData, weeklyHistory: [], lastSynced: new Date().toISOString() });
  }
}
