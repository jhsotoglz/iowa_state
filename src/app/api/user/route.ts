import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/database/mongodb";
import { ObjectId } from "mongodb";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Fetch the logged in user. 
export async function GET(req: NextRequest) {
  try {
    // Read the auth-token cookie
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    // Decode the token because of base64 login.
    const decoded = JSON.parse(Buffer.from(token, "base64").toString());

    const userId = decoded.userId;
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Get user from MongoDB
    const db = await getDb();
    const user = await db.collection("UserProfile").findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } 
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the user upon success.
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
