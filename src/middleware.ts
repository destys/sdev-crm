/* eslint-disable no-console */
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
  const locale = pathname.split("/")[1] || "en";

  console.log("🧩 Middleware fired:", { pathname, token, locale });

  // Пропускаем системные пути
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  const intlResponse = intlMiddleware(req);

  const isAuthPage = pathname.match(/^\/(ru|en)\/sign-(in|up)/);
  const isAppPage = pathname.match(/^\/(ru|en)\/dashboard(\/.*)?$/);
  const isRootPage = pathname.match(/^\/(ru|en)\/?$/);

  if ((isAppPage || isRootPage) && !token) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/sign-in`;
    console.log("➡️ Redirect to sign-in:", url.pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && token) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    console.log("➡️ Redirect to dashboard:", url.pathname);
    return NextResponse.redirect(url);
  }

  return intlResponse ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
