import { NextResponse } from "next/server";
import { walletData } from "@/lib/mock-data";
import { getGoogleAuth } from "@/lib/api-helpers";
import { FALLBACK_SHEET_ID } from "@/lib/finance-sheet";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function getBillingCycleMonth(date = new Date()) {
  const cycle = new Date(date);
  if (cycle.getDate() < 15) cycle.setMonth(cycle.getMonth() - 1);
  return `${cycle.getFullYear()}-${String(cycle.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET() {
  try {
    const auth = await getGoogleAuth();
    if (!auth) throw new Error("No Google credentials");

    const { google } = await import("googleapis");
    const sheets = google.sheets({ version: "v4", auth: auth as any });
    const sheetId = process.env.GOOGLE_SHEETS_ID || FALLBACK_SHEET_ID;

    const [walletRes, habitsRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "Wallet!A:Z" }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/habits`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
    ]);

    const rows = walletRes.data.values;
    if (!rows || rows.length < 2) throw new Error("No wallet data");

    const headers = rows[0];
    const currentCycleMonth = getBillingCycleMonth();

    const catIdx = headers.indexOf("category");
    const amtIdx = headers.indexOf("amount");
    const dateIdx = headers.indexOf("date");
    const limitIdx = headers.indexOf("limit");

    const categoryMap = new Map<string, { spent: number; limit: number }>();
    let totalSpent = 0;
    let totalLimit = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const date = row[dateIdx] || "";
      if (!date.startsWith(currentCycleMonth)) continue;

      const cat = row[catIdx] || "Other";
      const amt = parseFloat(row[amtIdx] || "0");
      const lim = parseFloat(row[limitIdx] || "0");

      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, { spent: 0, limit: lim });
        totalLimit += lim;
      }
      const entry = categoryMap.get(cat)!;
      entry.spent += amt;
      totalSpent += amt;
    }

    const breakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({ category, spent: data.spent, limit: data.limit }));

    const rewards = {
      health: 240,
      habits: 200,
      learning: 160,
      goals: 130,
      finance: habitsRes?.budgetCheckDone ? 240 : 0,
    };

    return NextResponse.json({
      spent: totalSpent,
      limit: totalLimit || 8500,
      currency: "NIS",
      breakdown,
      rewards,
      cycleAnchorDay: 15,
      cycleMonth: currentCycleMonth,
      history: [
        { month: "2026-02", health: 220, habits: 170, learning: 120, goals: 90, finance: 240 },
        { month: "2026-03", health: 240, habits: 190, learning: 160, goals: 110, finance: 240 },
        { month: "2026-04", health: 240, habits: 200, learning: 160, goals: 130, finance: rewards.finance },
      ],
    });
  } catch (e) {
    console.error("Wallet API error:", e);
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Wallet service unavailable",
        code: "SERVICE_UNAVAILABLE",
        data: {
          ...walletData,
          rewards: { health: 240, habits: 200, learning: 160, goals: 130, finance: 0 },
          cycleAnchorDay: 15,
          cycleMonth: getBillingCycleMonth(),
          history: [],
        },
      },
      { status: 503 },
    );
  }
}
