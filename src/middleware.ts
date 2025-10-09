import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * В Edge runtime нельзя напрямую использовать process.env —
 * поэтому значения прокидываем через NEXT_PUBLIC_* переменные.
 */
const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "cf_session";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const locale = pathname.split("/")[1];
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  // 1️⃣ Пропускаем системные пути и статические файлы
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // 2️⃣ Применяем next-intl для локализации
  const intlResponse = intlMiddleware(req);

  // 3️⃣ Зоны
  const isAuthPage = pathname.match(/^\/(ru|en)\/sign-in/);
  const isAppPage = pathname.match(/^\/(ru|en)\/dashboard/);
  const isRootPage = pathname.match(/^\/(ru|en)\/?$/);

  // 4️⃣ Нет токена → редирект на /sign-in
  if ((isAppPage || isRootPage) && !token) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/sign-in`;
    return NextResponse.redirect(url);
  }

  // 5️⃣ Уже авторизован → редирект с /sign-in в /dashboard
  if (isAuthPage && token) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // 6️⃣ Всё остальное пропускаем
  return intlResponse ?? NextResponse.next();
}

// 💡 Обязательно нужно, чтобы middleware применялся только к нужным маршрутам
export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
