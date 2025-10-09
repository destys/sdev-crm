import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

const API = process.env.NEXT_PUBLIC_API_URL!;
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "cf_session";
const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME || "cf_csrf";
const JWT_MAX_AGE = Number(process.env.JWT_MAX_AGE || 60 * 60 * 24 * 14); // 14d

// 🔒 naive in-memory rate limit (for demo). In prod: use Upstash/Redis.
const BUCKET = new Map<string, { count: number; ts: number }>();
const WINDOW = 60_000; // 60s
const LIMIT = 10;

function rateLimit(ip: string) {
  const now = Date.now();
  const rec = BUCKET.get(ip) ?? { count: 0, ts: now };
  if (now - rec.ts > WINDOW) {
    BUCKET.set(ip, { count: 1, ts: now });
    return true;
  }
  if (rec.count + 1 > LIMIT) return false;
  rec.count += 1;
  BUCKET.set(ip, rec);
  return true;
}

export async function POST(req: Request) {
  // 🧱 rate limit by IP
  const ip = (await headers()).get("x-forwarded-for") ?? "local";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  // 🔐 CSRF check (double submit)
  const sent = (await headers()).get("x-csrf-token") || "";
  const cookie = (await cookies()).get(CSRF_COOKIE_NAME)?.value || "";
  if (!sent || !cookie || sent !== cookie) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.identifier || !body?.password) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // 🔗 forward to Strapi
  const r = await fetch(`${API}/api/auth/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await r.json();
  if (!r.ok) {
    return NextResponse.json(
      { error: data?.error?.message ?? "Auth failed" },
      { status: r.status }
    );
  }

  // ✅ set httpOnly session cookie with Strapi JWT
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE_NAME, data.jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: JWT_MAX_AGE,
  });

  return res;
}
