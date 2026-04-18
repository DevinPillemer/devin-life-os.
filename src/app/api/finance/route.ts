import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuth } from "@/lib/api-helpers";
import { FALLBACK_SHEET_ID, parseBudgetSheet } from "@/lib/finance-sheet";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PERSONAL_GID = "536724729";
const FAMILY_GID = "1605934772";
const PERSONAL_RANGE = "'Devin Budget'!A1:Z200";
const FAMILY_RANGE = "'Joint Budget'!A1:Z200";

const SHEET_URL = `https://docs.google.com/spreadsheets/d/${FALLBACK_SHEET_ID}/edit`;

function sampleRows(rows: string[][] | undefined, size = 5) {
  return (rows || []).slice(0, size);
}

export async function GET(request: NextRequest) {
  const debugEnabled = request.nextUrl.searchParams.get("debug") === "1";
  const requestedMonth = request.nextUrl.searchParams.get("month") || undefined;
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID || FALLBACK_SHEET_ID;
  let personalRows: string[][] | undefined;
  let familyRows: string[][] | undefined;

  try {
    const auth = await getGoogleAuth();
    if (!auth) throw new Error("No Google credentials");

    const { google } = await import("googleapis");
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    console.error("[finance-api] spreadsheetId", spreadsheetId);
    console.error("[finance-api] personal", { gid: PERSONAL_GID, range: PERSONAL_RANGE, month: requestedMonth || "latest" });
    console.error("[finance-api] family", { gid: FAMILY_GID, range: FAMILY_RANGE, month: requestedMonth || "latest" });

    const [personalRes, familyRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: PERSONAL_RANGE }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: FAMILY_RANGE }),
    ]);

    personalRows = (personalRes.data.values || []) as string[][];
    familyRows = (familyRes.data.values || []) as string[][];

    console.error("[finance-api] personal rows", personalRows.length, sampleRows(personalRows, 3));
    console.error("[finance-api] family rows", familyRows.length, sampleRows(familyRows, 3));

    const personalParsed = parseBudgetSheet(personalRows, requestedMonth);
    const familyParsed = parseBudgetSheet(familyRows, requestedMonth);

    console.error("[finance-api] parse labels", {
      personal: {
        found: personalParsed.debug.foundLabels,
        missed: personalParsed.debug.missedLabels,
      },
      family: {
        found: familyParsed.debug.foundLabels,
        missed: familyParsed.debug.missedLabels,
      },
    });

    return NextResponse.json({
      totalNIS: personalParsed.snapshot.endBalance + familyParsed.snapshot.endBalance,
      changePercent: 0,
      changeTodayNIS: 0,
      allocation: { stocks: 0, crypto: 0, bonds: 0, cash: 0 },
      holdings: [],
      weekTrend: [],
      spreadsheetId,
      openSheetLinks: {
        personal: `${SHEET_URL}?gid=${PERSONAL_GID}#gid=${PERSONAL_GID}`,
        family: `${SHEET_URL}?gid=${FAMILY_GID}#gid=${FAMILY_GID}`,
      },
      personal: personalParsed.snapshot,
      family: familyParsed.snapshot,
      ...(debugEnabled
        ? {
            debug: {
              spreadsheetId,
              requestedMonth: requestedMonth || "latest",
              personal: {
                gid: PERSONAL_GID,
                range: PERSONAL_RANGE,
                rowCount: personalRows.length,
                firstRows: sampleRows(personalRows, 3),
                parse: personalParsed.debug,
              },
              family: {
                gid: FAMILY_GID,
                range: FAMILY_RANGE,
                rowCount: familyRows.length,
                firstRows: sampleRows(familyRows, 3),
                parse: familyParsed.debug,
              },
            },
          }
        : {}),
    });
  } catch (error: any) {
    const message = error?.message || "Failed to fetch finance sheet data";
    console.error("Finance API error:", error);
    return NextResponse.json(
      {
        error: message,
        sheetId: spreadsheetId,
        range: { personal: PERSONAL_RANGE, family: FAMILY_RANGE },
        rawRowsSample: {
          personal: sampleRows(personalRows),
          family: sampleRows(familyRows),
        },
      },
      { status: 500 },
    );
  }
}
