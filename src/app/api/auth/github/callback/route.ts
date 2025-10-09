import { NextResponse } from "next/server";

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL!;
const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "cf_session";

/**
 * 2️⃣ Обрабатываем обратный редирект после авторизации GitHub
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code param" }, { status: 400 });
  }

  try {
    // 🔗 Отправляем запрос на Strapi
    const r = await fetch(
      `${STRAPI_URL}/api/connect/github/callback?code=${code}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await r.json();

    if (!r.ok) {
      console.error("GitHub auth error:", data);
      return NextResponse.json(
        { error: data?.error?.message || "Auth failed" },
        { status: r.status }
      );
    }

    // ✅ Устанавливаем cookie с JWT
    const res = NextResponse.redirect("/");
    res.cookies.set(AUTH_COOKIE_NAME, data.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 14, // 14 дней
    });

    return res;
  } catch (err) {
    console.error("GitHub callback error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
