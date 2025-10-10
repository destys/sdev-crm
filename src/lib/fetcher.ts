/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/fetcher.ts
import { cookies } from "next/headers";

// Базовый адрес Strapi
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

// -------- Типы --------
type HeadersRecord = Record<string, string>;

interface FetcherArgs<TVariables = unknown> {
  url: string;
  method?: string;
  params?: Record<string, unknown>;
  data?: TVariables;
  headers?: HeadersRecord;
  signal?: AbortSignal | null;
  cache?: RequestCache;
  token?: string;
}

type InitExtra<TVariables> = RequestInit & {
  params?: Record<string, unknown>;
  data?: TVariables;
  token?: string;
  signal?: AbortSignal | null;
};

// -------- Перегрузки --------
export function fetcher<TData = any, TVariables = any>(
  url: string,
  init?: InitExtra<TVariables>
): Promise<TData>;

export function fetcher<TData = any, TVariables = any>(
  args: FetcherArgs<TVariables>
): Promise<TData>;

// -------- Реализация --------
export async function fetcher<TData = any, TVariables = any>(
  arg1: string | FetcherArgs<TVariables>,
  arg2?: InitExtra<TVariables>
): Promise<TData> {
  // Нормализуем аргументы к единому виду
  let url: string;
  let method: string | undefined;
  let params: Record<string, unknown> | undefined;
  let data: TVariables | undefined;
  let headersIn: HeadersInit | undefined;
  let signal: AbortSignal | undefined;
  let cache: RequestCache = "no-store";
  let token: string | undefined;

  if (typeof arg1 === "string") {
    url = arg1;
    method = arg2?.method as string | undefined;
    params = arg2?.params;
    data = arg2?.data;
    headersIn = arg2?.headers;
    signal = arg2?.signal ?? undefined;
    cache = (arg2?.cache as RequestCache) ?? "no-store";
    token = arg2?.token;
  } else {
    url = arg1.url;
    method = arg1.method;
    params = arg1.params;
    data = arg1.data;
    headersIn = arg1.headers;
    signal = arg1.signal ?? undefined;
    cache = arg1.cache ?? "no-store";
    token = arg1.token;
  }

  // Полный URL
  const fullUrl = new URL(url, API_URL);

  // Query string (Orval обычно уже даёт "плоские" ключи наподобие "populate[foo]")
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) {
        v.forEach((item) => fullUrl.searchParams.append(k, String(item)));
      } else {
        fullUrl.searchParams.append(k, String(v));
      }
    });
  }

  // Токен: сначала то, что явно передали, потом cookies на сервере, потом localStorage на клиенте
  if (!token) {
    if (typeof window === "undefined") {
      try {
        token = (await cookies()).get("token")?.value;
      } catch {
        /* ignore */
      }
    } else {
      try {
        token = localStorage.getItem("token") || undefined;
      } catch {
        /* ignore */
      }
    }
  }

  // Собираем заголовки в объект
  const headers: HeadersRecord = {};
  // Превращаем HeadersInit → Record
  if (headersIn) {
    const h = new Headers(headersIn as HeadersInit);
    h.forEach((value, key) => (headers[key] = value));
  }

  // Content-Type ставим только когда это НЕ FormData/Blob
  const isFormData =
    typeof FormData !== "undefined" && data instanceof FormData;
  const isBlob = typeof Blob !== "undefined" && data instanceof Blob;

  if (
    !isFormData &&
    !isBlob &&
    !headers["content-type"] &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Тело запроса
  let body: BodyInit | undefined;
  const upper = (method || "GET").toUpperCase();

  if (upper !== "GET" && upper !== "HEAD") {
    if (isFormData) body = data as unknown as BodyInit;
    else if (isBlob) body = data as unknown as BodyInit;
    else if (data !== undefined) body = JSON.stringify(data);
  }

  // Выполняем запрос
  const res = await fetch(fullUrl.toString(), {
    method: method || "GET",
    headers,
    body,
    cache,
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fetch error: ${res.status} ${res.statusText}\n${text}`);
  }

  // Strapi v5: { data, meta } | { error }
  const json = await res.json().catch(() => ({}));

  if (json?.error) {
    throw new Error(json.error?.message || "Strapi error");
  }

  return json as TData;
}
