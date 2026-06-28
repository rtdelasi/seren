import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Server-Sent Events (SSE) route handler.
 * Returns a ReadableStream that periodically queries the database for new messages in the thread.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");

  if (!threadId) {
    return new Response("Missing threadId query parameter", { status: 400 });
  }

  const responseStream = new ReadableStream({
    start(controller) {
      // Send connection acknowledgement
      controller.enqueue("data: connected\n\n");

      let lastChecked = new Date();

      // Poll database every 1.5 seconds for new messages in this thread
      const interval = setInterval(async () => {
        try {
          const newMessages = await prisma.message.findMany({
            where: {
              threadId,
              createdAt: { gt: lastChecked },
            },
            orderBy: { createdAt: "asc" },
          });

          if (newMessages.length > 0) {
            // Update cursor to the newest message timestamp
            lastChecked = newMessages[newMessages.length - 1].createdAt;
            for (const msg of newMessages) {
              controller.enqueue(`data: ${JSON.stringify(msg)}\n\n`);
            }
          }
        } catch (error) {
          console.warn("SSE stream database check failed, continuing stream connection...", error);
        }
      }, 1500);

      // Close interval and stream when connection is aborted by the client
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
