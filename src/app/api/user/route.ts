import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/database/mongodb";
import { ObjectId } from "mongodb";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Test 
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const testUserId = searchParams.get("userId") || "68eaead4773832b478adba02";

    const db = await getDb();
    const user = await db.collection("UserProfile").findOne(
      { _id: new ObjectId(testUserId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// Fetch a specific logged in user. This one is for the actual one, like getting the said logged in user.
/*export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = (await cookieStore).get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    const db = await getDb();
    const user = await db.collection("UserProfile").findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } 
    );

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}*/

