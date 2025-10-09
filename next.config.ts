import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "saas-crm.some-dev.com",
        pathname: "/**",
      },
    ],
  },
  /**
   * В NEXT_ENV / Edge runtime доступны только NEXT_PUBLIC_* переменные.
   * Поэтому все важные значения должны быть продублированы с этим префиксом.
   */
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "https://saas-crm.some-dev.com",
    NEXT_PUBLIC_AUTH_COOKIE_NAME:
      process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "cf_session",
    NEXT_PUBLIC_CSRF_COOKIE_NAME:
      process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME || "cf_csrf",
    NEXT_PUBLIC_JWT_MAX_AGE: process.env.NEXT_PUBLIC_JWT_MAX_AGE || "1209600",
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
