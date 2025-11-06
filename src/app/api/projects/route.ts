import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "cf_session";

/**
 * 📋 Получить список клиентов
 */
export async function GET(req: Request) {
  try {
    const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const query = searchParams.toString();

    const r = await fetch(
      `${API_URL}/api/projects${query ? `?${query}` : ""}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await r.json();

    if (!r.ok)
      return NextResponse.json(
        { error: data?.error?.message || "Failed to fetch projects" },
        { status: r.status }
      );

    // Strapi v5 возвращает data как массив готовых объектов
    return NextResponse.json({
      projects: data.data ?? [],
      total: data.meta.pagination.total,
    });
  } catch (err) {
    console.error("Proxy /api/projects GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * ➕ Создать клиента
 */
export async function POST(req: Request) {
  try {
    const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const r = await fetch(`${API_URL}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: body }),
    });

    const data = await r.json();
    if (!r.ok)
      return NextResponse.json(
        { error: data?.error?.message || "Failed to create project" },
        { status: r.status }
      );

    // В Strapi v5 data — уже объект клиента
    return NextResponse.json(data.data);
  } catch (err) {
    console.error("Proxy /api/projects POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
