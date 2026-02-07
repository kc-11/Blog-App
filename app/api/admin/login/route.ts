import { NextRequest, NextResponse } from "next/server";
import { getAdminToken, COOKIE_NAME } from "@/lib/auth";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: NextRequest) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    return NextResponse.json(
      { error: "Admin login not configured" },
      { status: 500 }
    );
  }
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid body" },
      { status: 400 }
    );
  }
  const password = typeof body?.password === "string" ? body.password : "";
  if (password !== secret) {
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  }
  const token = getAdminToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
