import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuth } from "@/lib/api-helpers";
import { FALLBACK_SHEET_ID, parseBudgetSheet } from "@/lib/finance-sheet";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PERSONAL_GID = "536724729";
const FAMILY_GID = "1605934772";
const PERSONAL_RANGE = "'Devin Budget'!A1:Z200";
const FAMILY_RANGE = "'Joint Budget'!A1:Z200";

function sampleRows(rows: string[][] | undefined, size = 5) {
  return (rows || []).slice(0, size);
}

export async function GET(request: NextRequest) {
  const requestedMonth = request.nextUrl.searchParams.get("month") || undefined;
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID || FALLBACK_SHEET_ID;

  try {
    const auth = await getGoogleAuth();
    if (!auth) throw new Error("No Google credentials");

    const { google } = await import("googleapis");
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    const [personalRes, familyRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: PERSONAL_RANGE }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: FAMILY_RANGE }),
    ]);

    const personalRows = (personalRes.data.values || []) as string[][];
    const familyRows = (familyRes.data.values || []) as string[][];

    const personalParsed = parseBudgetSheet(personalRows, requestedMonth);
    const familyParsed = parseBudgetSheet(familyRows, requestedMonth);

    return NextResponse.json({
      spreadsheetId,
      requestedMonth: requestedMonth || "latest",
      personal: {
        gid: PERSONAL_GID,
        range: PERSONAL_RANGE,
        rawRows: personalRows,
        rawRowsSample: sampleRows(personalRows),
        detectedMonthColumns: personalParsed.debug.availableMonths,
        detectedLabelRows: {
          found: personalParsed.debug.foundLabels,
          missed: personalParsed.debug.missedLabels,
        },
        parsed: personalParsed.snapshot,
      },
      family: {
        gid: FAMILY_GID,
        range: FAMILY_RANGE,
        rawRows: familyRows,
        rawRowsSample: sampleRows(familyRows),
        detectedMonthColumns: familyParsed.debug.availableMonths,
        detectedLabelRows: {
          found: familyParsed.debug.foundLabels,
          missed: familyParsed.debug.missedLabels,
        },
        parsed: familyParsed.snapshot,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Failed to read finance debug data",
        sheetId: spreadsheetId,
        range: { personal: PERSONAL_RANGE, family: FAMILY_RANGE },
        rawRowsSample: null,
      },
      { status: 500 },
    );
  }
}
