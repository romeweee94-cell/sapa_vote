import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { DEVICE_COOKIE } from "./auth";

/**
 * Reads the device_id cookie. If it doesn't exist, generates a new one
 * and writes it to the response so the browser stores it long-term.
 * This is a best-effort device fingerprint (a cleared cookie / different
 * browser will look like a new device) but is sufficient for a
 * "1 account per device" soft restriction on a poll site.
 */
export function getOrCreateDeviceId(
  req: NextRequest,
  res: NextResponse
): string {
  const existing = req.cookies.get(DEVICE_COOKIE)?.value;
  if (existing) return existing;

  const id = uuidv4();
  res.cookies.set(DEVICE_COOKIE, id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 2 // 2 years
  });
  return id;
}
