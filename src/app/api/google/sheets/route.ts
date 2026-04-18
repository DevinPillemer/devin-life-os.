import { NextResponse } from "next/server";
import { getGoogleAuth } from "@/lib/api-helpers";
import { FALLBACK_SHEET_ID, parseBudgetSheet } from "@/lib/finance-sheet";

export async function GET() {
  try {
    const auth = await getGoogleAuth();
    if (!auth) throw new Error("No Google credentials");

    const { google } = await import("googleapis");
    const sheets = google.sheets({ version: "v4", auth: auth as any });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID || FALLBACK_SHEET_ID;

    const [personalRes, familyRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: "'Devin Budget'!A:ZZ" }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: "'Joint Budget'!A:ZZ" }),
    ]);

    return NextResponse.json({
      spreadsheetId,
      personal: parseBudgetSheet((personalRes.data.values || []) as string[][]),
      family: parseBudgetSheet((familyRes.data.values || []) as string[][]),
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message || "Failed to fetch Google Sheets data" }, { status: 500 });
  }
}
