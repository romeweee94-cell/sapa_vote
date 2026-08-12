import { NextRequest, NextResponse } from "next/server";
import { signPayload, verifyToken } from "./session";

export const ADMIN_COOKIE = "admin_session";
export const USER_COOKIE = "user_session";
export const DEVICE_COOKIE = "device_id";

export function getAdminSession(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  return verifyToken<{ admin: true; iat: number }>(token);
}

export function getUserSession(req: NextRequest) {
  const token = req.cookies.get(USER_COOKIE)?.value;
  return verifyToken<{ userId: number; username: string }>(token);
}

export function setAdminCookie(res: NextResponse) {
  const token = signPayload({ admin: true, iat: Date.now() });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8 // 8 hours
  });
}

export function clearAdminCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
}

export function setUserCookie(
  res: NextResponse,
  payload: { userId: number; username: string }
) {
  const token = signPayload(payload);
  res.cookies.set(USER_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });
}

export function clearUserCookie(res: NextResponse) {
  res.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
}
