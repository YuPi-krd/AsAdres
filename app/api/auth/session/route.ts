import { NextRequest, NextResponse } from "next/server";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
const COOKIE_NAME = "doma_admin_session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token.trim().replace(/^Bearer\s+/i, "") : "";
    if (!token || token.length > 8192) {
      return NextResponse.json({ detail: "Некорректный токен сессии." }, { status: 400 });
    }

    const verify = await fetch(`${API_URL}/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await verify.json().catch(() => ({}));
    if (!verify.ok || data.role !== "admin" || data.telegram_2fa !== true) {
      return NextResponse.json({ detail: "Backend отклонил сессию администратора." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json({ detail: "Не удалось создать серверную сессию." }, { status: 502 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
