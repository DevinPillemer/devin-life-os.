// Retry helper with exponential backoff
export async function fetchWithRetry(
  fn: () => Promise<Response>,
  retries = 3,
  baseDelay = 500
): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fn();
      if (res.ok) return res;
      if (i === retries) return res;
    } catch (err) {
      if (i === retries) throw err;
    }
    await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, i)));
  }
  throw new Error("fetchWithRetry exhausted");
}

// Google auth helper
export async function getGoogleAuth() {
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credJson) return null;

  const { GoogleAuth } = await import("google-auth-library");
  const credentials = JSON.parse(credJson);
  return new GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
  });
}
