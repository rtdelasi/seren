import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ role: "guest" }, { status: 401 });
  }

  try {
    const therapist = await prisma.therapist.findFirst({
      where: { email: session.user.email },
    });

    if (therapist) {
      return NextResponse.json({ role: "therapist" });
    }
  } catch (error) {
    console.error("Failed to query role:", error);
  }

  return NextResponse.json({ role: "client" });
}
