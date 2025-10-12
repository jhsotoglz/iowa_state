import { NextResponse } from "next/server";

export async function POST() {
  // Create a response that clears the cookie
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });

  // Overwrite the cookie with an empty value and short expiration
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return response;
}