import { NextResponse } from "next/server";
import { getDb } from "@/database/mongodb";

export async function GET() {
  const dbo = await getDb();
  const coll = dbo.collection("Reviews");

  const companies = await coll.aggregate([
    { $group: { _id: "$companyName", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    { $project: { _id: 0, companyName: "$_id", avgRating: { $round: ["$avgRating", 2] }, count: 1 } },
    { $sort: { count: -1, avgRating: -1, companyName: 1 } },
    { $limit: 5 }
  ]).toArray();

  const majors = await coll.aggregate([
    { $match: { major: { $type: "string", $ne: "" } } },
    { $group: { _id: "$major", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    { $project: { _id: 0, major: "$_id", avgRating: { $round: ["$avgRating", 2] }, count: 1 } },
    { $sort: { count: -1, avgRating: -1, major: 1 } },
    { $limit: 5 }
  ]).toArray();

  return NextResponse.json({ ok: true, companies, majors });
}
