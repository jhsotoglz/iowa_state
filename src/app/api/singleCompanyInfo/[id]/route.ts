import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/database/mongodb";
import { ObjectId } from "mongodb";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// This fetches a specific company's information (sorry for this name)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const db = await getDb();
    const company = await db.collection("CompanyInfo").findOne({ _id: new ObjectId(id) });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ company }, { status: 200 });

  } catch (error) {
    console.error("Error Fetching company from companyInfo");
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}
