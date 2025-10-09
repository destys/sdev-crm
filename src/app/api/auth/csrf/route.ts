import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// ⚠️ Simple CSRF token generator (cryptographically strong random)
function randomToken(bytes = 32) {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(bytes))).toString(
    "base64url"
  );
}

export async function GET() {
  const token = randomToken(32);
  const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME || "cf_csrf";

  (await cookies()).set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // double-submit cookie (readable by client)
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60, // 1h
  });

  return NextResponse.json({ token });
}
