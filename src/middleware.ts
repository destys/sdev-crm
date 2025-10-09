import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "cf_session";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  // 1️⃣ Пропускаем служебные пути и статику
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // 2️⃣ Применяем i18n
  const res = intlMiddleware(req);
  const locale = req.nextUrl.pathname.split("/")[1] || "en";

  // 3️⃣ Зоны (Next.js не видит группировку (app)/(auth))
  const isAuthPage = pathname.match(/^\/(ru|en)\/sign-(in|up)/);
  const isAppPage = pathname.match(/^\/(ru|en)\/dashboard(\/.*)?$/);
  const isRootPage = pathname.match(/^\/(ru|en)\/?$/);

  // 4️⃣ Если пользователь не авторизован — редирект на sign-in
  if ((isAppPage || isRootPage) && !token) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/sign-in`;
    return NextResponse.redirect(url);
  }

  // 5️⃣ Если уже авторизован и идёт на sign-in — редиректим в dashboard
  if (isAuthPage && token) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return res ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
