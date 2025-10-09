import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * ⚙️ В Edge runtime доступны только NEXT_PUBLIC_* переменные.
 */
const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "cf_session";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  /**
   * 🧩 У тебя есть две локали: ru и en
   * Но английская — без префикса (/)
   */
  const isRu = pathname.startsWith("/ru");
  const locale = isRu ? "ru" : "en";

  // 1️⃣ Пропускаем системные и статические пути
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // 2️⃣ Подключаем i18n middleware
  const intlResponse = intlMiddleware(req);

  // 3️⃣ Определяем публичные страницы
  const isAuthPage = isRu
    ? /^\/ru\/sign-(in|up)/.test(pathname)
    : /^\/sign-(in|up)/.test(pathname);

  const isRootPage = isRu
    ? /^\/ru(\/)?$/.test(pathname)
    : /^\/$/.test(pathname);

  // 4️⃣ Если нет токена и это не auth-страница → редиректим на /sign-in
  if (!token && !isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = isRu ? "/ru/sign-in" : "/sign-in";
    return NextResponse.redirect(url);
  }

  // 5️⃣ Если токен есть и пользователь на sign-in / sign-up → редиректим на главную
  if (token && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = isRu ? "/ru" : "/";
    return NextResponse.redirect(url);
  }

  // 6️⃣ Всё остальное пропускаем
  return intlResponse ?? NextResponse.next();
}

/**
 * ✅ Middleware срабатывает только на страницах (не API и не статика)
 */
export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
