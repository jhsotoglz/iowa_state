import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password, role);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create simple session token (just user ID for hackathon)
    const token = generateToken(user);

    const response = NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      } 
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

async function authenticateUser(email: string, password: string, role?: string) {
  try {
    // Find user by email and password (plain text for hackathon simplicity)
    const user = await prisma.user.findFirst({
      where: { 
        email,
        password, // Direct password match - NOT for production!
        ...(role && { role })
      },
    });

    return user;
  } catch (error) {
    console.error("Error authenticating user:", error);
    return null;
  }
}

function generateToken(user: any) {
  // Simple token for hackathon - just encode user ID
  return Buffer.from(JSON.stringify({ 
    userId: user.id, 
    email: user.email,
    role: user.role 
  })).toString('base64');
}