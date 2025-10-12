export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/database/mongodb";
import { cookies } from "next/headers";

export async function PATCH(req: NextRequest) {
  try {
    const emailFromCookie = (await cookies()).get("email")?.value;
    if (!emailFromCookie) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    // Get update fields from request body
    const body = await req.json();

    // Build update object dynamically - only include fields that are present
    const updateFields: any = {
      updatedAt: new Date(),
    };

    // Only add fields if they exist in the request body
    if (body.workPreference !== undefined) {
      updateFields.workPreference = body.workPreference;
    }
    if (body.workAuthorization !== undefined) {
      updateFields.workAuthorization = body.workAuthorization;
    }
    if (body.graduationYear !== undefined) {
      updateFields.graduationYear = body.graduationYear;
    }
    if (body.major !== undefined) {
      updateFields.major = body.major;
    }
    if (body.matchedCompanies !== undefined) {
      // Now expecting company names instead of IDs
      updateFields.matchedCompanies = body.matchedCompanies;
    }

    // Update user in MongoDB using email
    const db = await getDb();
    const result = await db
      .collection("UserProfile")
      .updateOne(
        { email: emailFromCookie.trim().toLowerCase() },
        { $set: updateFields }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}