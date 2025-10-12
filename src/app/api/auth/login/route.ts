// app/api/auth/login/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/database/mongodb";

export async function POST(request: NextRequest) {
  const { email, password, role } = await request.json();
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const user = await db.collection("UserProfile").findOne({
    email,
    password,
    ...(role && { role }),
  });
  if (!user)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const res = NextResponse.json({
    success: true,
    user: {
      id: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
      workPreference: user.workPreference,
      workAuthorization: user.workAuthorization,
      graduationYear: user.graduationYear,
    },
  });

  // 👇 set email cookie (HttpOnly; unsigned — hackathon ok)
  res.cookies.set("email", user.email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
