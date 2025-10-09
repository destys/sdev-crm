import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "cf_session";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const locale = pathname.split("/")[1];
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  // 1️⃣ Пропускаем системные пути
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // 2️⃣ Применяем i18n
  const intlResponse = intlMiddleware(req);

  // 3️⃣ Определяем зоны
  const isAuthPage = pathname.match(/^\/(ru|en)\/\(auth\)\//);
  const isAppPage = pathname.match(/^\/(ru|en)\/\(app\)\//);
  const isRootPage = pathname.match(/^\/(ru|en)\/?$/); // 👈 корневая страница локали

  // 4️⃣ Если нет токена и пользователь пытается попасть на главную или в приложение
  if ((isAppPage || isRootPage) && !token) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/sign-in`;
    return NextResponse.redirect(url);
  }

  // 5️⃣ Если токен есть, но идёт на страницу входа — редирект в Dashboard
  if (isAuthPage && token) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // 6️⃣ Всё остальное — разрешено
  return intlResponse ?? NextResponse.next();
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
