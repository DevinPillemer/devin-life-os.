import { NextResponse } from "next/server";
import { habitsData } from "@/lib/mock-data";

export async function GET() {
  // TODO: Replace with real habits database/API call
  return NextResponse.json(habitsData);
}
