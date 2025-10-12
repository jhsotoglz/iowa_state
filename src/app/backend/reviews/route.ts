import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/database/mongodb";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";

/* ---------- helpers ---------- */
function bad(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}
function toInt(n: unknown) {
  const x = typeof n === "string" ? Number(n) : (n as number);
  return Number.isFinite(x) ? Math.trunc(x) : NaN;
}

/* ---------- GET /backend/reviews ---------- */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 100), 1), 200);

  const email = (await cookies()).get("email")?.value ?? null; // who is asking?

  const dbo = await getDb();
  const coll = dbo.collection("Reviews");

  const pipeline: any[] = [];

  if (q && q.trim()) {
    pipeline.push({
      $search: {
        index: "reviews_search",
        compound: {
          should: [
            { autocomplete: { path: "companyName", query: q, tokenOrder: "sequential", fuzzy: { maxEdits: 2 } } },
            { autocomplete: { path: "major",       query: q, tokenOrder: "sequential", fuzzy: { maxEdits: 2 } } },
            { text:        { path: ["companyName", "major", "comment"], query: q, fuzzy: { maxEdits: 2 } } }
          ],
          minimumShouldMatch: 1
        }
      }
    });
    pipeline.push({ $addFields: { _score: { $meta: "searchScore" } } });
    pipeline.push({ $sort: { _score: -1, createdAt: -1 } });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  // compute ownership on the server without exposing emails
  pipeline.push({
    $addFields: {
      mine: email ? { $eq: ["$email", email] } : false
    }
  });

  pipeline.push({ $limit: limit });
  pipeline.push({
    $project: {
      _id: { $toString: "$_id" },
      companyName: 1,
      comment: 1,
      rating: 1,
      major: 1,
      createdAt: { $dateToString: { date: "$createdAt" } },
      mine: 1,            // <- include this flag
      // never expose email
    }
  });

  const reviews = await coll.aggregate(pipeline).toArray();
  return NextResponse.json({ ok: true, reviews });
}

/* ---------- POST /backend/reviews ---------- */
export async function POST(req: NextRequest) {
  const email = (await cookies()).get("email")?.value;
  if (!email) return bad(401, "Unauthorized");

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return bad(400, "Invalid JSON body");

  const { companyName, comment, rating, major } = body as Record<string, unknown>;

  if (typeof companyName !== "string" || companyName.trim().length === 0 || companyName.length > 100)
    return bad(400, "companyName must be 1–100 chars");

  if (typeof comment !== "string" || comment.trim().length === 0 || comment.length > 200)
    return bad(400, "comment must be 1–200 chars");

  const r = toInt(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) return bad(400, "rating must be an integer 1–5");

  if (major && (typeof major !== "string" || major.length > 16))
    return bad(400, "major must be ≤16 characters");

  const db = await getDb();
  const insert = await db.collection("Reviews").insertOne({
    email, // from cookie
    companyName,
    comment,
    rating: r,
    major: typeof major === "string" ? major : null,
    createdAt: new Date(),
  });

  return NextResponse.json({ ok: true, id: String(insert.insertedId) }, { status: 201 });
}

/* ---------- PATCH /backend/reviews ---------- */
export async function PATCH(req: NextRequest) {
  const email = (await cookies()).get("email")?.value;
  if (!email) return bad(401, "Unauthorized");

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return bad(400, "Invalid JSON body");

  const { _id, comment, rating, major } = body as Record<string, unknown>;
  if (typeof _id !== "string" || !ObjectId.isValid(_id)) return bad(400, "Invalid review ID");

  const update: Record<string, any> = {};
  if (comment !== undefined) {
    if (typeof comment !== "string" || comment.trim().length === 0 || comment.length > 200)
      return bad(400, "comment must be 1–200 chars");
    update.comment = comment;
  }
  if (rating !== undefined) {
    const r = toInt(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) return bad(400, "rating must be integer 1–5");
    update.rating = r;
  }
  if (major !== undefined) {
    if (typeof major !== "string" || major.length > 16) return bad(400, "major must be ≤16 chars");
    update.major = major;
  }
  if (Object.keys(update).length === 0) return bad(400, "No valid fields provided for update");

  const dbo = await getDb();
  const result = await dbo.collection("Reviews").updateOne(
    { _id: new ObjectId(_id), email }, // enforce ownership
    { $set: update }
  );

  if (result.matchedCount === 0) return bad(404, "Review not found or not yours");
  return NextResponse.json({ ok: true, modified: result.modifiedCount });
}

/* ---------- DELETE /backend/reviews ---------- */
export async function DELETE(req: NextRequest) {
  const email = (await cookies()).get("email")?.value;
  if (!email) return bad(401, "Unauthorized");

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return bad(400, "Invalid JSON body");

  const { _id } = body as Record<string, unknown>;
  if (typeof _id !== "string" || !ObjectId.isValid(_id)) return bad(400, "Invalid review ID");

  const dbo = await getDb();
  const result = await dbo.collection("Reviews").deleteOne({ _id: new ObjectId(_id), email });

  if (result.deletedCount === 0) return bad(404, "Review not found or not yours");
  return NextResponse.json({ ok: true, deleted: true });
}
