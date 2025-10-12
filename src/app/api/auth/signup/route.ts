// app/api/auth/signup/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/database/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();
    const normEmail = String(email ?? "")
      .trim()
      .toLowerCase();

    if (!normEmail || !password) {
      return NextResponse.json(
        { error: "Email, password are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection("UserProfile");

    // Ensure unique emails (safe to call repeatedly)
    await users.createIndex({ email: 1 }, { unique: true });

    const existing = await users.findOne({ email: normEmail });
    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const result = await users.insertOne({
      email: normEmail,
      password, // ⚠️ hackathon only; use bcrypt later
      role: role || "Student",
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: String(result.insertedId),
          email: normEmail,
          role: role || "Student",
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
