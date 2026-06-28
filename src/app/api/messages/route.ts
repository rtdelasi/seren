import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Standard GET endpoint for polling new messages.
 * Queries messages in the thread since a specific timestamp.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");
  const since = searchParams.get("since");

  if (!threadId) {
    return new Response("Missing threadId query parameter", { status: 400 });
  }

  try {
    const where: any = { threadId };

    if (since) {
      const date = new Date(since);
      if (!isNaN(date.getTime())) {
        where.createdAt = { gt: date };
      }
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("HTTP messages polling database error:", error);
    return NextResponse.json([]);
  }
}
