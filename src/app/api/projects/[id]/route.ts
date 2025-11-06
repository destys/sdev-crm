import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "cf_session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const r = await fetch(`${API_URL}/api/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await r.json();
    if (!r.ok)
      return NextResponse.json(
        { error: data?.error?.message || "Failed to fetch project" },
        { status: r.status }
      );

    return NextResponse.json(data.data);
  } catch (err) {
    console.error("Proxy /api/projects/[id] GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const r = await fetch(`${API_URL}/api/projects/${id}`, {
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
        { error: data?.error?.message || "Failed to update project" },
        { status: r.status }
      );

    return NextResponse.json(data.data);
  } catch (err) {
    console.error("Proxy /api/projects/[id] PUT error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const r = await fetch(`${API_URL}/api/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!r.ok)
      return NextResponse.json(
        { error: "Failed to delete project" },
        { status: r.status }
      );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Proxy /api/projects/[id] DELETE error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
