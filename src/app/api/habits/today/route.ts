import { NextResponse } from "next/server";
import { habitsData } from "@/lib/mock-data";

export async function GET() {
  // Deprecated: use /api/habits instead
  return NextResponse.json(habitsData);
}
