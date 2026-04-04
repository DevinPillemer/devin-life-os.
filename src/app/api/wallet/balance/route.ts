import { NextResponse } from "next/server";

// Mock wallet data — in production, aggregate from all modules
const walletData = {
  total: 800,
  max: 1200,
  breakdown: [
    { module: "Health", earned: 180 },
    { module: "Habits", earned: 245 },
    { module: "Finance", earned: 120 },
    { module: "Learning", earned: 95 },
    { module: "Goals", earned: 160 },
  ],
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  return NextResponse.json(walletData);
}
