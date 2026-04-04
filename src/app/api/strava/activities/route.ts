import { NextResponse } from "next/server";
import { stravaData } from "@/lib/mock-data";

export async function GET() {
  // Deprecated: use /api/health instead
  return NextResponse.json(stravaData);
}
