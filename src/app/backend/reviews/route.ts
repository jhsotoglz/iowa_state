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
  const cursor = dbo.collection("Reviews").aggregate([
    { $match },
    { $sort: { createdAt: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: { $toString: "$_id" },
        // email intentionally omitted
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

/* ---------- POST /backend/reviews ---------- */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return bad(400, "Invalid JSON body");

  const { email, companyName, comment, rating, major } = body as Record<string, unknown>;

  // Validation
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

  const dbo = await getDb();
  const insert = await dbo.collection("Reviews").insertOne({
    email,               // stored but never exposed in GET
    companyName,
    comment,
    rating: r,
    major,
    createdAt: new Date(),
  });

  return NextResponse.json({ ok: true, id: insert.insertedId.toString() }, { status: 201 });
}

/* ---------- PATCH /backend/reviews ---------- */
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return bad(400, "Invalid JSON body");

  const { _id, email, comment, rating, major } = body as Record<string, unknown>;

  if (typeof email !== "string" || !email.includes("@")) return bad(400, "A valid email is required");
  if (typeof _id !== "string" || !ObjectId.isValid(_id)) return bad(400, "Invalid review ID");

  const update: Record<string, any> = {};
  if (comment !== undefined) {
    if (typeof comment !== "string" || comment.trim().length === 0 || comment.length > 200)
      return bad(400, "comment must be 1–200 chars");
    update.comment = comment;
  }
  if (rating !== undefined) {
    const r = toInt(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5)
      return bad(400, "rating must be integer 1–5");
    update.rating = r;
  }
  if (major !== undefined) {
    if (typeof major !== "string" || major.length > 16)
      return bad(400, "major must be ≤16 chars");
    update.major = major;
  }
  if (Object.keys(update).length === 0) return bad(400, "No valid fields provided for update");

  const dbo = await getDb();
  const result = await dbo.collection("Reviews").updateOne(
    { _id: new ObjectId(_id), email },
    { $set: update }
  );

  if (result.matchedCount === 0) return bad(404, "Review not found or email mismatch");

  return NextResponse.json({ ok: true, modified: result.modifiedCount });
}

/* ---------- DELETE /backend/reviews ---------- */
export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return bad(400, "Invalid JSON body");

  const { _id, email } = body as Record<string, unknown>;
  if (typeof email !== "string" || !email.includes("@")) return bad(400, "A valid email is required");
  if (typeof _id !== "string" || !ObjectId.isValid(_id)) return bad(400, "Invalid review ID");

  const dbo = await getDb();
  const result = await dbo.collection("Reviews").deleteOne({ _id: new ObjectId(_id), email });

  if (result.deletedCount === 0) return bad(404, "Review not found or email mismatch");

  return NextResponse.json({ ok: true, deleted: true });
}
