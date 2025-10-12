// app/api/user/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/database/mongodb";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);

    // 1) Prefer logged-in user via cookie (set by your login route)
    const emailFromCookie = (await cookies()).get("email")?.value;

    let query: any = null;

    if (emailFromCookie) {
      query = { email: emailFromCookie.trim().toLowerCase() };
    } else {
      // 2) Fallback: allow ?userId=... for testing
      const userId = searchParams.get("userId");
      if (!userId) {
        return NextResponse.json(
          { error: "Missing userId (and no login cookie)" },
          { status: 400 }
        );
      }
      if (!ObjectId.isValid(userId)) {
        return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
      }
      query = { _id: new ObjectId(userId) };
    }

    const doc = await db.collection("UserProfile").findOne(
      query,
      { projection: { password: 0, hashedPassword: 0 } } // never return passwords
    );

    if (!doc)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { _id, ...rest } = doc;
    return NextResponse.json(
      { user: { id: String(_id), ...rest } },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/user error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function PATCH(req: NextRequest) {
  try {
    // Read the auth-token cookie
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    // Decode the token
    const decoded = JSON.parse(Buffer.from(token, "base64").toString());
    const userId = decoded.userId;

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Get update fields from request body
    const { workPreference, workAuthorization, graduationYear } = await req.json();

    // Update user in MongoDB
    const db = await getDb();
    const result = await db.collection("UserProfile").updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: {
          workPreference,
          workAuthorization,
          graduationYear,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: "User updated successfully"
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
