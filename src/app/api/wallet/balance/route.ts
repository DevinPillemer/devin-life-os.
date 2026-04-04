import { NextResponse } from "next/server";
import { walletData } from "@/lib/mock-data";

export async function GET() {
  // TODO: Replace with real wallet/database call
  return NextResponse.json(walletData);
}
