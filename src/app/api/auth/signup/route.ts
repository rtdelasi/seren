import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify user duplication
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // Provision User record matching authorize callback plain text passwords
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });

    // If role is therapist, provision corresponding therapist clinical profile
    if (role === "therapist") {
      await prisma.therapist.create({
        data: {
          name,
          email,
          pricePerSession: 150,
          specialties: ["General Therapy"],
          languages: ["English"],
          bio: "Licensed practitioner.",
        },
      });
    }

    return NextResponse.json({ message: "Registration successful", userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during signup" }, { status: 500 });
  }
}
