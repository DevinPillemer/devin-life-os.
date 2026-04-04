import { NextResponse } from "next/server";
import { sheetsData } from "@/lib/mock-data";

export async function GET() {
  // TODO: Replace with real Google Sheets API call
  // const auth = new google.auth.GoogleAuth({ credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!) });
  // const sheets = google.sheets({ version: "v4", auth });
  return NextResponse.json(sheetsData);
}
