import { NextResponse } from "next/server";
import { stravaData } from "@/lib/mock-data";

export async function GET() {
  // TODO: Replace with real Strava API call
  // const res = await fetch("https://www.strava.com/api/v3/athlete/activities", {
  //   headers: { Authorization: `Bearer ${process.env.STRAVA_ACCESS_TOKEN}` },
  // });
  return NextResponse.json(stravaData);
}
