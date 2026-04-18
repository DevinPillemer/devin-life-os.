import { NextResponse } from "next/server";
import { financeData } from "@/lib/mock-data";
import { getGoogleAuth } from "@/lib/api-helpers";
import { FALLBACK_SHEET_ID, parseBudgetSheet } from "@/lib/finance-sheet";

export const revalidate = 300;

const SHEET_URL = `https://docs.google.com/spreadsheets/d/${FALLBACK_SHEET_ID}/edit`;

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

    const personal = parseBudgetSheet((personalRes.data.values || []) as string[][]);
    const family = parseBudgetSheet((familyRes.data.values || []) as string[][]);

    return NextResponse.json({
      totalNIS: personal.endBalance + family.endBalance,
      changePercent: 0,
      changeTodayNIS: 0,
      allocation: financeData.allocation,
      holdings: financeData.holdings,
      weekTrend: financeData.weekTrend,
      spreadsheetId,
      openSheetLinks: {
        personal: `${SHEET_URL}?gid=536724729#gid=536724729`,
        family: `${SHEET_URL}?gid=1605934772#gid=1605934772`,
      },
      personal,
      family,
    });
  } catch (e) {
    console.error("Finance API error:", e);
    return NextResponse.json({
      ...financeData,
      spreadsheetId: FALLBACK_SHEET_ID,
      openSheetLinks: {
        personal: `${SHEET_URL}?gid=536724729#gid=536724729`,
        family: `${SHEET_URL}?gid=1605934772#gid=1605934772`,
      },
      personal: {
        monthLabel: "Apr-26",
        billingPeriod: "Mar 15 – Apr 14, 2026",
        openingBalance: 0,
        liveBankBalanceActual: 0,
        endBalance: 0,
        totalIncome: 0,
        totalExpenses: 7061,
        totalCharities: 0,
        totalTransfers: 0,
        totalInvestments: 0,
        totalLoans: 0,
        totalContributions: 0,
        ccExpenses: [
          { label: "Gyms & Fitness", value: 375 },
          { label: "Food Shopping (Personal)", value: 239 },
          { label: "Eating Out & Delivery", value: 1393 },
          { label: "Transportation (Parking/Train/Taxi)", value: 93 },
          { label: "SaaS & AI Tools (Tech Subs)", value: 2939 },
          { label: "Miscellaneous / Other", value: 1048 },
          { label: "Bike & E-Scooter Mobility", value: 548 },
          { label: "Alcohol & Entertainment", value: 426 },
        ],
        sections: [],
      },
      family: {
        monthLabel: "Apr-26",
        billingPeriod: "Mar 15 – Apr 14, 2026",
        openingBalance: 0,
        liveBankBalanceActual: 0,
        endBalance: 0,
        totalIncome: 23000,
        totalExpenses: 0,
        totalCharities: 0,
        totalTransfers: 0,
        totalInvestments: 0,
        totalLoans: 0,
        totalContributions: 23000,
        ccExpenses: [],
        sections: [],
      },
    });
  }
}
