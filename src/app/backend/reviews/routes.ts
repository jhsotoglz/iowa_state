import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/database/mongodb";
import { ObjectId } from "mongodb";

/* ---------- simple helpers ---------- */
function bad(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function toInt(n: unknown) {
  const x = typeof n === "string" ? Number(n) : (n as number);
  return Number.isFinite(x) ? Math.trunc(x) : NaN;
}

/* ---------- GET /backend/reviews ---------- */
/**
 * Optional query params:
 *   ?companyName=Collins%20AeroSpace
 *   ?limit=50
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyName = searchParams.get("companyName");
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 50), 1), 200);

  const $match: any = {};
  if (companyName) $match.companyName = { $regex: `^${companyName}$`, $options: "i" };

  const dbo = await getDb();
  const cursor = dbo.collection("reviews").aggregate([
    { $match },
    { $sort: { createdAt: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: { $toString: "$_id" },
        // not adding email so it's never exposed to the client
        companyName: 1,
        comment: 1,
        rating: 1,
        major: 1,
        createdAt: { $dateToString: { date: "$createdAt" } },
      },
    },
  ]);

  const reviews = await cursor.toArray();
  return NextResponse.json({ ok: true, reviews });
}

/* POST src/app/backend/reviews */
/**
 * Expects JSON body:
 * {
 *   "email": "student@iastate.edu",
 *   "companyName": "New Way Trucks",
 *   "comment": "Great recruiter and detailed info",
 *   "rating": 5,
 *   "major": "SE"
 * }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return bad(400, "Invalid JSON body");

  const { email, companyName, comment, rating, major } = body as Record<string, unknown>;

  // Validating data
  if (typeof email !== "string" || !email.includes("@") || email.length > 120)
    return bad(400, "A valid email is required");

  if (typeof companyName !== "string" || companyName.trim().length === 0 || companyName.length > 100)
    return bad(400, "companyName must be 1–100 chars");

  if (typeof comment !== "string" || comment.trim().length === 0 || comment.length > 200)
    return bad(400, "comment must be 1–200 chars");

  const r = toInt(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5)
    return bad(400, "rating must be an integer 1–5");

  if (major && (typeof major !== "string" || major.length > 16))
    return bad(400, "major must be ≤16 characters");

// Adding review to mongo

  const dbo = await getDb();
  const insert = await dbo.collection("reviews").insertOne({
    email,               // stored but never shown in UI
    companyName,
    comment,
    rating: r,
    major,
    createdAt: new Date(),
  });

  return NextResponse.json(
    { ok: true, id: insert.insertedId.toString() },
    { status: 201 }
  );
}
