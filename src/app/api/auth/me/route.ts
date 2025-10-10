import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "cf_session";

/**
 * 🔁 Проксирует запрос на Strapi /api/users/me
 * Берёт JWT из httpOnly cookie и добавляет в Authorization
 */
export async function GET() {
  try {
    const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const r = await fetch(`${API_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await r.json();

    if (!r.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "Failed to fetch user" },
        { status: r.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Proxy /api/auth/me error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
