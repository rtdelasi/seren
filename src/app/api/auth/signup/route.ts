import { NextResponse } from "next/server";
import { signUp } from "@/actions/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    // Map client-side role selectors ("client" | "therapist") to enum UserRole ("CLIENT" | "THERAPIST")
    const mappedRole =
      role?.toLowerCase() === "therapist" ? "THERAPIST" : "CLIENT";

    const result = await signUp({
      name,
      email,
      password,
      role: mappedRole,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Registration successful" }, { status: 201 });
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during signup" }, { status: 500 });
  }
}
