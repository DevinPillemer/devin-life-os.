import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      return NextResponse.json(
        { error: "Google Sheets API not configured. Set GOOGLE_SHEETS_ID and GOOGLE_SERVICE_ACCOUNT_JSON." },
        { status: 503 }
      );
    }

    // Parse service account credentials
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    // Create JWT for Google API auth
    // In production, use google-auth-library for proper JWT signing
    // For now, this shows the integration pattern
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: createJWT(credentials),
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.json({ error: "Google auth failed" }, { status: 401 });
    }

    const { access_token } = await tokenRes.json();

    const sheetsRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/Portfolio!A1:G50`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    if (!sheetsRes.ok) {
      return NextResponse.json({ error: "Failed to fetch spreadsheet" }, { status: sheetsRes.status });
    }

    const data = await sheetsRes.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Placeholder JWT creation — in production use google-auth-library
function createJWT(credentials: any): string {
  // This is a placeholder. In production, properly sign a JWT using
  // the service account's private key with RS256.
  // Install: npm install google-auth-library
  // Then use: const auth = new google.auth.GoogleAuth({ credentials, scopes: [...] });
  return "placeholder-jwt";
}
