import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/database/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection("UserLogin");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const user = {
      email,
      password,
      name,
      role: role || "Student",
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(user);

    // Generate token
    const token = generateToken({
      id: result.insertedId.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.insertedId.toString(),
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
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
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
