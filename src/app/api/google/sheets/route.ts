import { NextResponse } from "next/server";
import { walletData } from "@/lib/mock-data";

export async function GET() {
  // Deprecated: use /api/finance and /api/wallet instead
  return NextResponse.json(walletData);
}
