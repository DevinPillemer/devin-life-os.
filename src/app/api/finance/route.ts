import { NextResponse } from "next/server";
import { financeData } from "@/lib/mock-data";
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
      range: "Finance!A:Z",
    });

    const rows = res.data.values;
    if (!rows || rows.length < 2) throw new Error("No finance data");

    // Parse latest row - expected columns: totalNIS, changePercent, changeTodayNIS,
    // stocks%, crypto%, bonds%, cash%, holding1Name, holding1Value, holding1Change, ...
    const headers = rows[0];
    const latest = rows[rows.length - 1];

    const get = (col: string) => {
      const idx = headers.indexOf(col);
      return idx >= 0 ? latest[idx] : null;
    };

    const totalNIS = parseFloat(get("totalNIS") || "0");
    const changePercent = parseFloat(get("changePercent") || "0");
    const changeTodayNIS = parseFloat(get("changeTodayNIS") || "0");

    // Build week trend from last 7 rows
    const weekTrend = rows
      .slice(-7)
      .map((r: string[]) => parseFloat(r[headers.indexOf("totalNIS")] || "0"));

    const holdings = [];
    for (let i = 1; i <= 3; i++) {
      const name = get(`holding${i}Name`);
      if (name) {
        holdings.push({
          name,
          value: parseFloat(get(`holding${i}Value`) || "0"),
          changePercent: parseFloat(get(`holding${i}Change`) || "0"),
        });
      }
    }

    return NextResponse.json({
      totalNIS,
      changePercent,
      changeTodayNIS,
      allocation: {
        stocks: parseFloat(get("stocks") || "55"),
        crypto: parseFloat(get("crypto") || "20"),
        bonds: parseFloat(get("bonds") || "15"),
        cash: parseFloat(get("cash") || "10"),
      },
      holdings,
      weekTrend,
    });
  } catch (e) {
    console.error("Finance API error:", e);
    return NextResponse.json(financeData);
  }
}
