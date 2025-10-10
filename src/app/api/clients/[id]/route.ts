import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "cf_session";

/**
 * 📄 Получить одного клиента
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const r = await fetch(`${API_URL}/api/clients/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await r.json();
    if (!r.ok)
      return NextResponse.json(
        { error: data?.error?.message || "Failed to fetch client" },
        { status: r.status }
      );

    // В v5 data — объект клиента
    return NextResponse.json(data.data);
  } catch (err) {
    console.error("Proxy /api/clients/[id] GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const r = await fetch(`${API_URL}/api/clients/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: body }),
    });

    const data = await r.json();
    if (!r.ok)
      return NextResponse.json(
        { error: data?.error?.message || "Failed to update client" },
        { status: r.status }
      );

    return NextResponse.json(data.data);
  } catch (err) {
    console.error("Proxy /api/clients/[id] PUT error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const r = await fetch(`${API_URL}/api/clients/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!r.ok)
      return NextResponse.json(
        { error: "Failed to delete client" },
        { status: r.status }
      );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Proxy /api/clients/[id] DELETE error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
