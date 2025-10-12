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
    console.error("Error Fetching companies from companyInfo");
    return NextResponse.json(
      { error: "Failed to fetch companies" },
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
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
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
