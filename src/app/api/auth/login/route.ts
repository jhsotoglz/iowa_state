import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/database/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection("users");

    // Find user
    const user = await usersCollection.findOne({
      email,
      password,
      ...(role && { role }),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

function generateToken(user: any) {
  return Buffer.from(
    JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
  ).toString("base64");
}