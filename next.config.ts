import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * ✅ Базовые настройки проекта
 * (всё, что не чувствительно — можно читать напрямую в коде)
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Позволяет работать с внешними ресурсами, если Strapi отдает изображения
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "saas-crm.some-dev.com",
        pathname: "/**",
      },
    ],
  },

  // Экспортируем в рантайм только нужные переменные
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "https://saas-crm.some-dev.com",
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME || "cf_session",
    CSRF_COOKIE_NAME: process.env.CSRF_COOKIE_NAME || "cf_csrf",
    JWT_MAX_AGE: process.env.JWT_MAX_AGE || "1209600", // 14 дней
  },
};

/**
 * ✅ Подключаем next-intl плагин
 */
const withNextIntl = createNextIntlPlugin();

/**
 * Экспорт финального конфига
 */
export default withNextIntl(nextConfig);
