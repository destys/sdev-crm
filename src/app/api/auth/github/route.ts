import { NextResponse } from "next/server";

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL!;

/**
 * 1️⃣ Редиректим пользователя на OAuth-авторизацию GitHub через Strapi
 */
export async function GET() {
  const redirectUrl = `${STRAPI_URL}/api/connect/github`;
  return NextResponse.redirect(redirectUrl);
}
