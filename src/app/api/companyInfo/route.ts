// app/backend/companies/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/database/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const companies = await db.collection("CompanyInfo").find({}).toArray();
    return NextResponse.json({ companies }, { status: 200 });
  } catch (error) {
    console.error("Error fetching companies from CompanyInfo:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

/* ------------------- POST: create a new company ------------------- */
export async function POST(req: NextRequest) {
  try {
    const db = await getDb();

    // ✅ read body ONCE
    const body = await req.json();

    const {
      companyName,
      website = null,
      industry = null,
      sponsorVisa = false,
      boothNumber = null,
      majors = [],
      employmentTypes = [],
      recruiters = [],
      recruiterInfo, // optional single object fallback
      count,
    } = body ?? {};

    // --- validation ---
    if (!companyName || !String(companyName).trim()) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    // build recruiters array from recruiters[] or single recruiterInfo
    let recruiterArr: Array<{ name: string; email: string; phone?: string }> =
      Array.isArray(recruiters) ? recruiters : [];
    if (!recruiterArr.length && recruiterInfo?.email)
      recruiterArr = [recruiterInfo];

    // sanitize recruiters
    recruiterArr = recruiterArr
      .map((r: any) => ({
        name: String(r?.name || "").trim(),
        email: String(r?.email || "").trim(),
        phone: String(r?.phone || "").trim(),
      }))
      .filter((r) => r.name && isEmail(r.email));

    // document to insert
    const doc = {
      companyName: String(companyName).trim(),
      website: website || null,
      industry: industry || null,
      sponsorVisa: Boolean(sponsorVisa),

      boothNumber: boothNumber ?? { lat: 0, lng: 0 },
      majors: Array.isArray(majors) ? majors : [],
      // store under employmentType field in DB
      employmentType: Array.isArray(employmentTypes) ? employmentTypes : [],
      recruiterInfo: recruiterArr,
      count: typeof count === "number" ? count : 0,
      createdAt: new Date(),
    };

    const result = await db.collection("CompanyInfo").insertOne(doc);
    return NextResponse.json(
      { company: { _id: result.insertedId, ...doc } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding company:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updateData } = body;

    if (!id || !updateData) {
      return NextResponse.json(
        { error: "Missing id or updateData" },
        { status: 400 }
      );
    }

    const objectId = ObjectId.createFromHexString(id);

    const db = await getDb();
    const result = await db
      .collection("CompanyInfo")
      .updateOne({ _id: objectId }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Company updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}
