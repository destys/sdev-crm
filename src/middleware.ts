import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * ⚙️ В Edge runtime доступны только NEXT_PUBLIC_* переменные.
 */
const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "cf_session";

/**
 * Подключаем next-intl middleware для определения локали.
 */
const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  /**
   * 🌍 Проверяем, указана ли локаль в URL
   * (например, /en/... или /ru/...)
   */
  const hasLocalePrefix = /^\/(ru|en)(\/|$)/.test(pathname);

  // 1️⃣ Пропускаем API, Next.js и статику
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // 2️⃣ Если локаль не указана — редиректим на дефолтную (например, en)
  if (!hasLocalePrefix) {
    const url = req.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.redirect(url);
  }

  // 3️⃣ Пропускаем локализацию через next-intl
  const intlResponse = intlMiddleware(req);

  // 4️⃣ Определяем публичные страницы (auth)
  const isAuthPage = /^\/(ru|en)\/sign-(in|up)/.test(pathname);

  // 5️⃣ Если пользователь не авторизован и идёт не на auth → редиректим на sign-in
  if (!token && !isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.startsWith("/ru") ? "/ru/sign-in" : "/en/sign-in";
    return NextResponse.redirect(url);
  }

  // 6️⃣ Если авторизован и находится на sign-in / sign-up → на главную
  if (token && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.startsWith("/ru") ? "/ru" : "/en";
    return NextResponse.redirect(url);
  }

  // 7️⃣ Всё остальное — пропускаем
  return intlResponse ?? NextResponse.next();
}

/**
 * ✅ Middleware срабатывает только на страницах (не API и не статика)
 */
export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
