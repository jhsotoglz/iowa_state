import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/database/mongodb";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
