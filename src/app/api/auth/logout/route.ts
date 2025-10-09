import { NextResponse } from "next/server";

export async function POST() {
  const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "cf_session";
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
