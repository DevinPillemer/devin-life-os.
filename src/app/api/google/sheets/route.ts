import { NextResponse } from "next/server";
import { getGoogleAuth } from "@/lib/api-helpers";
import { FALLBACK_SHEET_ID, parseBudgetSheet } from "@/lib/finance-sheet";

const PERSONAL_RANGE = "'Devin Budget'!A1:Z200";
const FAMILY_RANGE = "'Joint Budget'!A1:Z200";

export async function GET(request: Request) {
  try {
    const auth = await getGoogleAuth();
    if (!auth) throw new Error("No Google credentials");

    const month = new URL(request.url).searchParams.get("month") || undefined;

    const { google } = await import("googleapis");
    const sheets = google.sheets({ version: "v4", auth: auth as any });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID || FALLBACK_SHEET_ID;

    const [personalRes, familyRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: PERSONAL_RANGE }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: FAMILY_RANGE }),
    ]);

    return NextResponse.json({
      spreadsheetId,
      personal: parseBudgetSheet((personalRes.data.values || []) as string[][], month),
      family: parseBudgetSheet((familyRes.data.values || []) as string[][], month),
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message || "Failed to fetch Google Sheets data" }, { status: 500 });
  }
}
