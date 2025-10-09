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

  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "https://saas-crm.some-dev.com",
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME || "cf_session",
    CSRF_COOKIE_NAME: process.env.CSRF_COOKIE_NAME || "cf_csrf",
    JWT_MAX_AGE: process.env.JWT_MAX_AGE || "1209600",
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
