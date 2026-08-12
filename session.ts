import crypto from "crypto";

// Fallback secret so the app still works out-of-the-box without any
// manual environment variable setup. For better security, set a custom
// SESSION_SECRET in your Vercel project's Environment Variables.
const FALLBACK_SECRET = "vote-app-default-session-secret-please-change-me";

function getSecret() {
  return process.env.SESSION_SECRET || FALLBACK_SECRET;
}

/**
 * Creates a signed, base64url-encoded token of the form
 * "<base64payload>.<hmac signature>" so it can be safely stored in a cookie
 * without a database lookup.
 */
export function signPayload(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  const body = Buffer.from(json).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken<T = Record<string, unknown>>(
  token: string | undefined | null
): T | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}
