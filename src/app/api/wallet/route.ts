import { NextResponse } from "next/server";
import { walletData } from "@/lib/mock-data";
import { getGoogleAuth } from "@/lib/api-helpers";

export const revalidate = 300;

export async function GET() {
  try {
    const auth = await getGoogleAuth();
    if (!auth) throw new Error("No Google credentials");

    const { google } = await import("googleapis");
    const sheets = google.sheets({ version: "v4", auth: auth as any });
    const sheetId = "1PRwlbD23jpdn5W6PbE6flvwcQLGpk_HmWagCEruJIeE";

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Wallet!A:Z",
    });

    const rows = res.data.values;
    if (!rows || rows.length < 2) throw new Error("No wallet data");

    const headers = rows[0];
    // Sum current month spending by category
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

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
      if (!date.startsWith(currentMonth)) continue;

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

    const breakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      spent: data.spent,
      limit: data.limit,
    }));

    return NextResponse.json({
      spent: totalSpent,
      limit: totalLimit || 8500,
      currency: "NIS",
      breakdown,
    });
  } catch (e) {
    console.error("Wallet API error:", e);
    return NextResponse.json(walletData);
  }
}
