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

let missingCredsWarned = false;

function isProductionBuildPhase() {
  return process.env.NODE_ENV === "production" && process.env.NEXT_PHASE === "phase-production-build";
}

function warnMissingCredentialsIfNeeded() {
  if (missingCredsWarned) return;
  const isVercelProd = process.env.VERCEL_ENV === "production";
  if (isVercelProd && isProductionBuildPhase()) {
    console.warn(
      "[google-auth] GOOGLE_SERVICE_ACCOUNT_JSON is missing during production build. " +
      "Continuing build; Google-backed APIs will return runtime 503 until credentials are configured.",
    );
    missingCredsWarned = true;
  }
}

// Google auth helper
export async function getGoogleAuth() {
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credJson) {
    warnMissingCredentialsIfNeeded();
    return null;
  }

  const { GoogleAuth } = await import("google-auth-library");
  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(credJson);
  } catch {
    throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON");
  }
  return new GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
  });
}
