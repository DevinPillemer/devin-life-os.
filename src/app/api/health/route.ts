import { NextResponse } from "next/server";
import { stravaData } from "@/lib/mock-data";

export const revalidate = 120;

async function getStravaToken(): Promise<string | null> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
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

export async function GET() {
  try {
    const token = await getStravaToken();
    if (!token) throw new Error("No Strava token");

    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartUnix = Math.floor(weekStart.getTime() / 1000);

    // Also get last week start for comparison
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekStartUnix = Math.floor(lastWeekStart.getTime() / 1000);

    const activitiesRes = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${lastWeekStartUnix}&per_page=30`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!activitiesRes.ok) throw new Error("Strava activities fetch failed");
    const allActivities = await activitiesRes.json();

    const thisWeek = allActivities.filter(
      (a: any) => new Date(a.start_date).getTime() >= weekStart.getTime()
    );
    const lastWeek = allActivities.filter(
      (a: any) =>
        new Date(a.start_date).getTime() >= lastWeekStart.getTime() &&
        new Date(a.start_date).getTime() < weekStart.getTime()
    );

    const totalKm = thisWeek.reduce((s: number, a: any) => s + (a.distance || 0) / 1000, 0);
    const totalMinutes = thisWeek.reduce((s: number, a: any) => s + (a.moving_time || 0) / 60, 0);
    const lastWeekKm = lastWeek.reduce((s: number, a: any) => s + (a.distance || 0) / 1000, 0);

    // Build 7-day chart
    const weekChart = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      const dayStr = day.toISOString().split("T")[0];
      const dayActivities = thisWeek.filter(
        (a: any) => a.start_date.split("T")[0] === dayStr
      );
      return {
        day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        km: Math.round(dayActivities.reduce((s: number, a: any) => s + (a.distance || 0) / 1000, 0) * 10) / 10,
        minutes: Math.round(dayActivities.reduce((s: number, a: any) => s + (a.moving_time || 0) / 60, 0)),
      };
    });

    const activities = thisWeek.slice(0, 6).map((a: any) => ({
      type: typeMap[a.type] || a.type.toLowerCase(),
      label: a.name,
      km: Math.round((a.distance || 0) / 1000 * 10) / 10,
      minutes: Math.round((a.moving_time || 0) / 60),
    }));

    return NextResponse.json({
      sessions: thisWeek.length,
      totalKm: Math.round(totalKm * 10) / 10,
      totalMinutes: Math.round(totalMinutes),
      weeklyGoal: { target: 5, completed: thisWeek.length },
      vsLastWeek: {
        kmDelta: Math.round((totalKm - lastWeekKm) * 10) / 10,
        sessionsDelta: thisWeek.length - lastWeek.length,
      },
      weekChart,
      activities,
    });
  } catch (e) {
    console.error("Health API error:", e);
    return NextResponse.json(stravaData);
  }
}
